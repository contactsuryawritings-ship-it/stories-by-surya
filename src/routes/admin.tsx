import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { Btn, Notice, Panel, TextInput } from "@/components/admin/ui";
import { DraftProvider, useDraft } from "@/lib/admin/draft";
import { useContent } from "@/lib/content/useContent";
import { adminEmail } from "@/lib/firebase/config";
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
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/galleries", label: "Galleries", exact: false },
  { to: "/admin/films", label: "Films", exact: false },
  { to: "/admin/homepage", label: "Homepage", exact: false },
  { to: "/admin/about", label: "About", exact: false },
  { to: "/admin/contact", label: "Contact", exact: false },
  { to: "/admin/enquiries", label: "Enquiries", exact: false },
  { to: "/admin/seo", label: "SEO", exact: false },
  { to: "/admin/settings", label: "Settings", exact: false },
] as const;

function SignInScreen({
  onSignIn,
}: {
  onSignIn: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSignIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <h1 className="font-display text-3xl">Studio</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to manage the website.</p>

        <div className="mt-8 grid gap-4">
          <label className="block">
            <span className="eyebrow block opacity-60">Email</span>
            <span className="mt-2 block">
              <TextInput type="email" value={email} onChange={setEmail} />
            </span>
          </label>
          <label className="block">
            <span className="eyebrow block opacity-60">Password</span>
            <span className="mt-2 block">
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-hairline bg-background px-3 py-2 text-sm font-light outline-none focus:border-foreground"
              />
            </span>
          </label>
          {error ? <Notice tone="error">{error}</Notice> : null}
          <Btn type="submit" variant="primary" disabled={busy}>
            {busy ? "Signing in" : "Sign in"}
          </Btn>
        </div>

        <Link to="/" className="eyebrow mt-8 inline-block opacity-50 hover:opacity-100">
          Back to website
        </Link>
      </form>
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
          {email ? <span className="hidden text-xs text-muted-foreground sm:inline">{email}</span> : null}
          <Btn onClick={discard} disabled={!dirty || saving}>
            Discard
          </Btn>
          <Btn variant="primary" onClick={() => void save()} disabled={!dirty || saving || !canPersist}>
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

function DashboardShell({ onSignOut, email }: { onSignOut: (() => void) | null; email: string | null }) {
  const { canPersist } = useDraft();
  const { source } = useContent();

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
            <div className="mb-6">
              <Notice tone="info">
                No saved content was found yet. You are editing the starter structure — your first
                save will create data.json.
              </Notice>
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

  // Local development without Firebase: the dashboard is usable, saving is not.
  if (!configured) {
    return (
      <DraftProvider>
        <DashboardShell onSignOut={null} email={null} />
      </DraftProvider>
    );
  }

  if (!user) return <SignInScreen onSignIn={signIn} />;

  if (adminEmail && (user.email ?? "").toLowerCase() !== adminEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <Panel title="Not authorised" className="max-w-md">
          <p className="text-sm text-muted-foreground">
            This account may not manage the website.
          </p>
          <div className="mt-5">
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
