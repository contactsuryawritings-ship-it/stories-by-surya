/**
 * Firebase configuration abstraction.
 *
 * Values come from environment variables (publishable Firebase web config).
 * Nothing else in the app reads import.meta.env for Firebase.
 */
export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId?: string;
  appId: string;
};

const env = import.meta.env as Record<string, string | undefined>;

export const firebaseConfig: FirebaseWebConfig = {
  apiKey: env["VITE_FIREBASE_API_KEY"] ?? "",
  authDomain: env["VITE_FIREBASE_AUTH_DOMAIN"] ?? "",
  projectId: env["VITE_FIREBASE_PROJECT_ID"] ?? "",
  storageBucket: env["VITE_FIREBASE_STORAGE_BUCKET"] ?? "",
  messagingSenderId: env["VITE_FIREBASE_MESSAGING_SENDER_ID"] ?? "",
  appId: env["VITE_FIREBASE_APP_ID"] ?? "",
};

/** True when enough config exists to talk to Firebase. */
export const isFirebaseConfigured =
  firebaseConfig.apiKey.length > 0 &&
  firebaseConfig.projectId.length > 0 &&
  firebaseConfig.storageBucket.length > 0 &&
  firebaseConfig.appId.length > 0;

/** Storage paths used by the app. */
export const storagePaths = {
  content: "content/data.json",
  contentBackup: (stamp: string) => `content/backups/data-${stamp}.json`,
  galleryImage: (galleryId: string, imageId: string, ext = "webp") =>
    `images/${galleryId}/${imageId}.${ext}`,
  filmCover: (filmId: string, ext = "webp") => `films/${filmId}/cover.${ext}`,
  aboutPortrait: (ext = "webp") => `about/portrait.${ext}`,
  enquiry: (id: string) => `enquiries/${id}.json`,
  enquiriesDir: "enquiries",
};
