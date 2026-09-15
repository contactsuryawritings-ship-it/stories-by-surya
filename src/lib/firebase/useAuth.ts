import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";

import { getFirebaseAuth, isFirebaseConfigured } from "./app";

export type AuthState = {
  user: User | null;
  loading: boolean;
  configured: boolean;
};

/** Firebase Authentication state for the photographer dashboard. */
export function useAuth(): AuthState & {
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: isFirebaseConfigured,
    configured: isFirebaseConfigured,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setState({ user: null, loading: false, configured: false });
      return;
    }
    const auth = getFirebaseAuth();
    void getRedirectResult(auth).catch(() => undefined);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState({ user, loading: false, configured: true });
    });
    return unsubscribe;
  }, []);

  return {
    ...state,
    signIn: async () => {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(getFirebaseAuth(), provider);
      } catch (error) {
        if (error instanceof Error && error.message.includes("auth/popup-blocked")) {
          await signInWithRedirect(getFirebaseAuth(), provider);
          return;
        }
        throw error;
      }
    },
    signOutUser: async () => {
      await signOut(getFirebaseAuth());
    },
  };
}
