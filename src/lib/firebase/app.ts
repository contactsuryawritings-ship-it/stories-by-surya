import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

import { firebaseConfig, isFirebaseConfigured } from "./config";

/**
 * Lazy Firebase accessors. Firebase is only initialised in the browser and only
 * when configuration is present, so the site never crashes when keys are absent.
 */

let app: FirebaseApp | null = null;

export class FirebaseNotConfiguredError extends Error {
  constructor() {
    super("Firebase is not configured yet.");
    this.name = "FirebaseNotConfiguredError";
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) throw new FirebaseNotConfiguredError();
  if (app) return app;
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirebaseStorage(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}

export { isFirebaseConfigured };
