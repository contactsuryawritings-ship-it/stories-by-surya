import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";

const adminApp = getApps().length ? getApps()[0] : initializeApp();
const storage = getStorage(adminApp);
const auth = getAuth(adminApp);

const allowedFieldIds = new Set([
  "name",
  "email",
  "phone",
  "occasion",
  "date",
  "location",
  "message",
]);

const enquiryInputSchema = z
  .object({
    values: z.record(z.string(), z.string()).refine((values) => Object.keys(values).length > 0, {
      message: "Enquiry is empty.",
    }),
  })
  .strict();

const ipRateLimit = new Map<string, number>();

function getClientKey(request: {
  rawRequest: {
    headers?: Record<string, string | string[] | undefined>;
    socket?: { remoteAddress?: string | undefined };
  };
}): string {
  const forwarded = request.rawRequest.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].split(",")[0].trim();
  }
  return request.rawRequest.socket?.remoteAddress ?? "unknown";
}

function normalizeValues(values: Record<string, string>) {
  const next: Record<string, string> = {};

  for (const [key, value] of Object.entries(values)) {
    const trimmedKey = key.trim();
    if (!allowedFieldIds.has(trimmedKey)) {
      throw new HttpsError("invalid-argument", "Unexpected enquiry field.");
    }
    const text = String(value ?? "").trim();
    if (text.length === 0 && trimmedKey !== "phone") {
      throw new HttpsError("invalid-argument", "Required enquiry fields are missing.");
    }
    if (trimmedKey === "email" && text.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      throw new HttpsError("invalid-argument", "Please enter a valid email address.");
    }
    if (text.length > 2000) {
      throw new HttpsError("invalid-argument", "One or more fields are too long.");
    }
    next[trimmedKey] = text;
  }

  const requiredKeys = ["name", "email"];
  for (const key of requiredKeys) {
    if (!next[key] || next[key].length === 0) {
      throw new HttpsError("invalid-argument", "Required enquiry fields are missing.");
    }
  }

  return next;
}

export const submitEnquiry = onCall({ region: "us-central1" }, async (request) => {
  const clientKey = getClientKey(request);
  const now = Date.now();
  const previous = ipRateLimit.get(clientKey) ?? 0;

  if (now - previous < 10000) {
    throw new HttpsError(
      "resource-exhausted",
      "Please wait a moment before sending another enquiry.",
    );
  }
  ipRateLimit.set(clientKey, now);

  const parsed = enquiryInputSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", "Your enquiry payload is invalid.");
  }

  const values = normalizeValues(parsed.data.values);
  const id = `enq-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const payload = {
    id,
    createdAt: new Date().toISOString(),
    values,
  };

  const file = storage.bucket().file(`enquiries/${id}.json`);
  await file.save(JSON.stringify(payload, null, 2), {
    contentType: "application/json",
    gzip: false,
    metadata: {
      contentType: "application/json",
      cacheControl: "no-store",
    },
  });

  return { ok: true, id };
});

const publicCacheTag = "stories-by-surya-public";

function configuredAdminEmails() {
  return (process.env["ADMIN_EMAILS"] ?? process.env["VITE_ADMIN_EMAILS"] ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export const publishPublicCache = onCall({ region: "us-central1" }, async (request) => {
  const email = request.auth?.token.email?.trim().toLowerCase();
  if (!email || !configuredAdminEmails().includes(email)) {
    throw new HttpsError("permission-denied", "You are not authorized to publish content.");
  }

  await auth.getUser(request.auth!.uid);

  const token = process.env["VERCEL_API_TOKEN"];
  const projectId = process.env["VERCEL_PROJECT_ID"];
  if (!token || !projectId) {
    return {
      ok: true,
      configured: false,
      message: "Content published; CDN purge is not configured.",
    };
  }

  const endpoint =
    process.env["VERCEL_CACHE_INVALIDATION_URL"] ??
    "https://api.vercel.com/v1/edge-cache/invalidate";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ projectId, tags: [publicCacheTag] }),
  });
  if (!response.ok) {
    throw new HttpsError("internal", `CDN purge failed (${response.status}).`);
  }

  return { ok: true, configured: true, message: "Public site refreshed." };
});
