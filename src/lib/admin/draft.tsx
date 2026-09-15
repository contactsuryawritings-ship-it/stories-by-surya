import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { safeParseContent, type SiteContent } from "../content/schema";
import { useContent, useSaveContent } from "../content/useContent";
import { isFirebaseConfigured } from "../firebase/app";

/**
 * Dashboard editing session.
 *
 * All dashboard screens mutate one in-memory draft of the content model. The
 * draft is only written to data.json (validated, previous version backed up)
 * when the photographer saves.
 */
type DraftContextValue = {
  draft: SiteContent;
  /** The version the draft was seeded from — guards against clobbering. */
  baseUpdatedAt: string;
  dirty: boolean;
  saving: boolean;
  /** True when Firebase config exists, i.e. saving is possible at all. */
  canPersist: boolean;
  error: string | null;
  savedAt: string | null;
  update: (recipe: (draft: SiteContent) => SiteContent) => void;
  save: (nextDraft?: SiteContent) => Promise<void>;
  discard: () => void;
};

const DraftContext = createContext<DraftContextValue | null>(null);

export function DraftProvider({ children }: { children: ReactNode }) {
  const { content } = useContent();
  const saveMutation = useSaveContent();

  const [session, setSession] = useState(() => ({
    draft: content,
    base: content.updatedAt,
    dirty: false,
  }));
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Re-seed from the loaded content until the photographer starts editing.
  useEffect(() => {
    setSession((prev) =>
      prev.dirty ? prev : { draft: content, base: content.updatedAt, dirty: false },
    );
  }, [content]);

  const update = useCallback((recipe: (draft: SiteContent) => SiteContent) => {
    setError(null);
    setSession((prev) => ({ ...prev, draft: recipe(prev.draft), dirty: true }));
  }, []);

  const discard = useCallback(() => {
    setError(null);
    setSession({ draft: content, base: content.updatedAt, dirty: false });
  }, [content]);

  const save = useCallback(
    async (nextDraft = session.draft) => {
      setError(null);

      const parsed = safeParseContent(nextDraft);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        setError(
          issue
            ? `${issue.path.join(".") || "content"}: ${issue.message}`
            : "Content is not valid.",
        );
        return;
      }

      for (const social of parsed.data.socials) {
        const value = social.url.trim();
        if (!value) continue;
        const isWhatsAppNumber =
          social.platform.toLowerCase() === "whatsapp" && !/^https?:\/\//i.test(value);
        if (isWhatsAppNumber) {
          if (value.replace(/\D/g, "").length < 7) {
            setError(`${social.label || social.platform}: enter a valid phone number or URL.`);
            return;
          }
          continue;
        }
        try {
          const url = new URL(value);
          if (!/^https?:$/.test(url.protocol)) throw new Error("unsupported protocol");
        } catch {
          setError(`${social.label || social.platform}: enter a valid http(s) URL.`);
          return;
        }
      }

      if (!isFirebaseConfigured) {
        setError("Firebase is not configured, so changes cannot be saved yet.");
        return;
      }

      try {
        const saved = await saveMutation.mutateAsync({
          next: parsed.data,
          ...(session.base ? { expectedUpdatedAt: session.base } : {}),
        });
        setSession({ draft: saved, base: saved.updatedAt, dirty: false });
        setSavedAt(saved.updatedAt);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Changes could not be saved.");
      }
    },
    [saveMutation, session.base, session.draft],
  );

  const value = useMemo<DraftContextValue>(
    () => ({
      draft: session.draft,
      baseUpdatedAt: session.base,
      dirty: session.dirty,
      saving: saveMutation.isPending,
      canPersist: isFirebaseConfigured,
      error,
      savedAt,
      update,
      save,
      discard,
    }),
    [session, saveMutation.isPending, error, savedAt, update, save, discard],
  );

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useDraft(): DraftContextValue {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error("useDraft must be used inside the dashboard.");
  return ctx;
}

/* ---------------- Small immutable helpers shared by dashboard screens ---------------- */

export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];
  if (from < 0 || from >= next.length || to < 0 || to >= next.length) return next;
  const [item] = next.splice(from, 1);
  if (item === undefined) return next;
  next.splice(to, 0, item);
  return next;
}

export function reindex<T extends { order: number }>(list: readonly T[]): T[] {
  return list.map((item, index) => ({ ...item, order: index }));
}
