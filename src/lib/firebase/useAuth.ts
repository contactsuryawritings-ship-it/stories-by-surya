import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
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
  signIn: (email: string, password: string) => Promise<void>;
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
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      setState({ user, loading: false, configured: true });
    });
    return unsubscribe;
  }, []);

  return {
    ...state,
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    },
    signOutUser: async () => {
      await signOut(getFirebaseAuth());
    },
  };
}
