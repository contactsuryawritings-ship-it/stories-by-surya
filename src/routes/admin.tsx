import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Btn, Notice, Panel } from "@/components/admin/ui";
import { DraftProvider, useDraft } from "@/lib/admin/draft";
import { initializeDefaultContentIfMissing } from "@/lib/content/store";
import { useContent } from "@/lib/content/useContent";
import { adminEmails } from "@/lib/firebase/config";
import { useAuth } from "@/lib/firebase/useAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Studio — Stories by Surya" },
      { name: "description", content: "Private content dashboard for Stories by Surya." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Studio — Stories by Surya" },
      { property: "og:description", content: "Private content dashboard." },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin/photos", label: "Photos", exact: false },
  { to: "/admin/films", label: "Films", exact: false },
  { to: "/admin/homepage", label: "Content", exact: false },
  { to: "/admin/settings", label: "Settings", exact: false },
] as const;

function SignInScreen({ onSignIn }: { onSignIn: () => Promise<void> }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleGoogleSignIn() {
    setBusy(true);
    setError("");
    try {
      await onSignIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl">Studio</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to manage the website.</p>

        <div className="mt-8 grid gap-4">
          {error ? <Notice tone="error">{error}</Notice> : null}
          <Btn variant="primary" disabled={busy} onClick={() => void handleGoogleSignIn()}>
            {busy ? "Continuing with Google" : "Continue with Google"}
          </Btn>
        </div>

        <Link to="/" className="eyebrow mt-8 inline-block opacity-50 hover:opacity-100">
          Back to website
        </Link>
      </div>
    </div>
  );
}

function SaveBar({ onSignOut, email }: { onSignOut: (() => void) | null; email: string | null }) {
  const { dirty, saving, save, discard, error, canPersist, savedAt } = useDraft();

  return (
    <div className="sticky top-0 z-30 border-b border-hairline bg-background/95 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <span className="eyebrow opacity-55">
          {dirty ? "Unsaved changes" : savedAt ? "All changes saved" : "No changes"}
        </span>
        <span className="ml-auto flex flex-wrap items-center gap-2">
          {email ? (
            <span className="hidden text-xs text-muted-foreground sm:inline">{email}</span>
          ) : null}
          <Btn onClick={discard} disabled={!dirty || saving}>
            Discard
          </Btn>
          <Btn
            variant="primary"
            onClick={() => void save()}
            disabled={!dirty || saving || !canPersist}
          >
            {saving ? "Saving" : "Save"}
          </Btn>
          {onSignOut ? <Btn onClick={onSignOut}>Sign out</Btn> : null}
        </span>
      </div>
      {error ? (
        <div className="px-4 pb-3 sm:px-6">
          <Notice tone="error">{error}</Notice>
        </div>
      ) : null}
    </div>
  );
}

function DashboardShell({
  onSignOut,
  email,
}: {
  onSignOut: (() => void) | null;
  email: string | null;
}) {
  const { canPersist } = useDraft();
  const { source } = useContent();
  const location = useLocation();
  const navigate = useNavigate();
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    if (location.pathname === "/admin") {
      void navigate({ to: "/admin/photos" });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-muted/30">
      <SaveBar onSignOut={onSignOut} email={email} />

      <div className="mx-auto flex w-full max-w-[110rem] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <nav aria-label="Dashboard" className="lg:w-52 lg:shrink-0">
          <Link to="/" className="font-display text-xl">
            Stories by Surya
          </Link>
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 lg:flex-col lg:gap-2">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  className="eyebrow block py-1 opacity-55 transition-opacity hover:opacity-100"
                  activeProps={{ className: "eyebrow block py-1 opacity-100" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">
          {!canPersist ? (
            <div className="mb-6">
              <Notice tone="warn">
                Firebase is not configured. You can explore and edit everything here, but changes,
                uploads and enquiries cannot be saved until the Firebase keys are added.
              </Notice>
            </div>
          ) : source === "default" ? (
            <div className="mb-6 space-y-3">
              <Notice tone="info">
                No saved content was found yet. You are editing the starter structure — your first
                save will create data.json.
              </Notice>
              <div>
                <Btn
                  variant="primary"
                  disabled={initializing}
                  onClick={async () => {
                    setInitializing(true);
                    try {
                      await initializeDefaultContentIfMissing();
                    } finally {
                      setInitializing(false);
                    }
                  }}
                >
                  {initializing ? "Initializing" : "Initialize production data"}
                </Btn>
              </div>
            </div>
          ) : null}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminLayout() {
  const { user, loading, configured, signIn, signOutUser } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="eyebrow opacity-50">Loading</p>
      </div>
    );
  }

  if (!adminEmails.length) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <Panel title="Admin access not configured" className="max-w-md">
          <p className="text-sm text-muted-foreground">
            Authorized Google admin accounts are not configured for production access.
          </p>
        </Panel>
      </div>
    );
  }

  // Local development without Firebase: the dashboard is usable, saving is not.
  if (!configured) {
    return (
      <DraftProvider>
        <DashboardShell onSignOut={null} email={null} />
      </DraftProvider>
    );
  }

  if (!user) return <SignInScreen onSignIn={() => signIn()} />;

  const normalizedUserEmail = (user.email ?? "").trim().toLowerCase();
  const isAuthorizedAdmin = adminEmails.includes(normalizedUserEmail);

  if (!isAuthorizedAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <Panel title="This Google account is not authorized" className="max-w-md">
          <p className="text-sm text-muted-foreground">
            This Google account may not manage the website.
          </p>
          <div className="mt-5 flex gap-2">
            <Btn onClick={() => void signOutUser()}>Sign out</Btn>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <DraftProvider>
      <DashboardShell onSignOut={() => void signOutUser()} email={user.email ?? null} />
    </DraftProvider>
  );
}
