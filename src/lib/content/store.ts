import {
  getBytes,
  getDownloadURL,
  ref,
  uploadString,
  listAll,
  deleteObject,
} from "firebase/storage";

import { getFirebaseStorage, isFirebaseConfigured } from "../firebase/app";
import { storagePaths } from "../firebase/config";
import { cloneDefaultContent, defaultContent } from "./default-data";
import { safeParseContent, type SiteContent, type Enquiry } from "./schema";

export type ContentState = {
  content: SiteContent;
  /** Where the content came from — used for elegant degradation messaging. */
  source: "remote" | "default";
  error?: string;
};

const decoder = new TextDecoder();

/** Load and validate data.json from Firebase Storage. Never throws. */
export async function loadContent(): Promise<ContentState> {
  if (!isFirebaseConfigured) {
    return { content: defaultContent, source: "default", error: "firebase-not-configured" };
  }
  try {
    const bytes = await getBytes(ref(getFirebaseStorage(), storagePaths.content));
    const parsed = safeParseContent(JSON.parse(decoder.decode(bytes)));
    if (!parsed.success) {
      return { content: defaultContent, source: "default", error: "invalid-content" };
    }
    return { content: parsed.data, source: "remote" };
  } catch {
    // Missing file (fresh project) or Storage unavailable — degrade elegantly.
    return { content: cloneDefaultContent(), source: "default", error: "content-unavailable" };
  }
}

/**
 * Save flow: validate -> back up previous valid version -> write -> confirm.
 * `expectedUpdatedAt` guards against overwriting newer changes.
 */
export async function saveContent(
  next: SiteContent,
  expectedUpdatedAt?: string,
): Promise<SiteContent> {
  const parsed = safeParseContent(next);
  if (!parsed.success) {
    throw new Error(`Content failed validation: ${parsed.error.issues[0]?.message ?? "unknown"}`);
  }

  const storage = getFirebaseStorage();
  const contentRef = ref(storage, storagePaths.content);

  // 1. Load current valid data and back it up before replacing anything.
  let currentRaw: string | null = null;
  try {
    const bytes = await getBytes(contentRef);
    currentRaw = decoder.decode(bytes);
  } catch {
    currentRaw = null;
  }

  if (currentRaw) {
    try {
      const current = safeParseContent(JSON.parse(currentRaw));
      if (current.success && expectedUpdatedAt && current.data.updatedAt !== expectedUpdatedAt) {
        throw new Error(
          "This content was changed elsewhere since you loaded it. Reload before saving.",
        );
      }
      if (current.success) {
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");
        await uploadString(ref(storage, storagePaths.contentBackup(stamp)), currentRaw, "raw", {
          contentType: "application/json",
        });
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("This content was changed")) throw err;
      // Unparseable current file: nothing valid to protect, continue.
    }
  }

  const toWrite: SiteContent = { ...parsed.data, updatedAt: new Date().toISOString() };
  await uploadString(contentRef, JSON.stringify(toWrite, null, 2), "raw", {
    contentType: "application/json",
  });

  // Confirm the write round-trips.
  const verifyBytes = await getBytes(contentRef);
  const verified = safeParseContent(JSON.parse(decoder.decode(verifyBytes)));
  if (!verified.success) throw new Error("Save could not be verified.");
  return verified.data;
}

/* ---------------- Enquiries (stored as JSON objects, no database) ---------------- */

export async function submitEnquiry(values: Record<string, string>): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Enquiries are not connected yet.");
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const payload: Enquiry = { id, createdAt: new Date().toISOString(), values };
  await uploadString(
    ref(getFirebaseStorage(), storagePaths.enquiry(id)),
    JSON.stringify(payload, null, 2),
    "raw",
    { contentType: "application/json" },
  );
}

export async function listEnquiries(): Promise<Enquiry[]> {
  const storage = getFirebaseStorage();
  const listing = await listAll(ref(storage, storagePaths.enquiriesDir));
  const items = await Promise.all(
    listing.items.map(async (item) => {
      try {
        const bytes = await getBytes(item);
        return JSON.parse(decoder.decode(bytes)) as Enquiry;
      } catch {
        return null;
      }
    }),
  );
  return items
    .filter((x): x is Enquiry => Boolean(x))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteEnquiry(id: string): Promise<void> {
  await deleteObject(ref(getFirebaseStorage(), storagePaths.enquiry(id)));
}

/* ---------------- Storage helpers ---------------- */

export async function urlForPath(path: string): Promise<string> {
  return getDownloadURL(ref(getFirebaseStorage(), path));
}

export async function deleteStoragePath(path: string): Promise<void> {
  try {
    await deleteObject(ref(getFirebaseStorage(), path));
  } catch {
    // Already gone — not an error for the photographer.
  }
}
