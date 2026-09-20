import { getFunctions, httpsCallable } from "firebase/functions";

import { getFirebaseApp } from "../firebase/app";

type PublishResponse = {
  ok: boolean;
  configured: boolean;
  message: string;
};

/** Ask the authenticated server function to invalidate the public cache. */
export async function publishPublicCache(): Promise<PublishResponse> {
  const callable = httpsCallable<undefined, PublishResponse>(
    getFunctions(getFirebaseApp(), "us-central1"),
    "publishPublicCache",
  );
  const response = await callable(undefined);
  return response.data;
}
