import { deleteObject, getBytes, listAll, ref, uploadString } from "firebase/storage";

import { getFirebaseStorage, isFirebaseConfigured } from "../firebase/app";
import { storagePaths } from "../firebase/config";
import { enquirySchema, type Enquiry } from "../content/schema";

/**
 * Enquiry persistence adapter.
 *
 * The project intentionally uses Firebase Auth + Firebase Storage only — there
 * is no Firestore and no general-purpose database. Enquiries are therefore
 * persisted as individual validated JSON objects in Storage.
 *
 * When Firebase is not configured the adapter reports itself unavailable. It
 * never pretends a submission succeeded, and the dashboard never renders
 * placeholder records.
 */
export type EnquiryAdapter = {
  /** Human-readable name of the backing store, for the dashboard. */
  readonly name: string;
  /** False when no persistence is configured. */
  readonly available: boolean;
  submit(values: Record<string, string>): Promise<void>;
  list(): Promise<Enquiry[]>;
  remove(id: string): Promise<void>;
};

const decoder = new TextDecoder();

const NOT_CONFIGURED = "Enquiries are not connected yet.";

const unavailableAdapter: EnquiryAdapter = {
  name: "Not configured",
  available: false,
  async submit() {
    throw new Error(NOT_CONFIGURED);
  },
  async list() {
    throw new Error(NOT_CONFIGURED);
  },
  async remove() {
    throw new Error(NOT_CONFIGURED);
  },
};

const storageAdapter: EnquiryAdapter = {
  name: "Firebase Storage",
  available: true,

  async submit(values) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const payload: Enquiry = { id, createdAt: new Date().toISOString(), values };
    await uploadString(
      ref(getFirebaseStorage(), storagePaths.enquiry(id)),
      JSON.stringify(payload, null, 2),
      "raw",
      { contentType: "application/json" },
    );
  },

  async list() {
    const listing = await listAll(ref(getFirebaseStorage(), storagePaths.enquiriesDir));
    const items = await Promise.all(
      listing.items.map(async (item) => {
        try {
          const bytes = await getBytes(item);
          const parsed = enquirySchema.safeParse(JSON.parse(decoder.decode(bytes)));
          return parsed.success ? parsed.data : null;
        } catch {
          return null;
        }
      }),
    );
    return items
      .filter((entry): entry is Enquiry => entry !== null)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async remove(id) {
    await deleteObject(ref(getFirebaseStorage(), storagePaths.enquiry(id)));
  },
};

export const enquiryAdapter: EnquiryAdapter = isFirebaseConfigured
  ? storageAdapter
  : unavailableAdapter;
