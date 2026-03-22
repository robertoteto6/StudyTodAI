"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";

type AuthCardProps = {
  locale: string;
  dictionary: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    name: string;
    signIn: string;
    signUp: string;
    signInGoogle: string;
    toggleToSignUp: string;
    toggleToSignIn: string;
    demoHint: string;
  };
};

export function AuthCard({ locale, dictionary }: AuthCardProps) {
  const router = useRouter();
  const { authMode, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(name, email, password);
      }
      router.push(`/${locale}/projects`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    setError(null);

    try {
      await signInWithGoogle();
      router.push(`/${locale}/projects`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="glass-panel w-full max-w-md rounded-[2rem] p-6 sm:p-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-soft)]">
          {authMode === "firebase" ? "Firebase Auth" : "Local Demo"}
        </p>
        <h1 className="display-text text-4xl">{dictionary.title}</h1>
        <p className="text-sm leading-6 text-[var(--color-ink-soft)]">{dictionary.subtitle}</p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <Input
            placeholder={dictionary.name}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        ) : null}
        <Input
          type="email"
          placeholder={dictionary.email}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          type="password"
          placeholder={dictionary.password}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button className="w-full" disabled={busy} type="submit">
          {mode === "signin" ? dictionary.signIn : dictionary.signUp}
        </Button>
      </form>

      <Button className="mt-3 w-full" variant="secondary" disabled={busy} onClick={handleGoogle}>
        {dictionary.signInGoogle}
      </Button>

      <div className="mt-5 flex items-center justify-between text-sm">
        <button
          className="text-[var(--color-accent-strong)]"
          onClick={() => setMode((current) => (current === "signin" ? "signup" : "signin"))}
          type="button"
        >
          {mode === "signin" ? dictionary.toggleToSignUp : dictionary.toggleToSignIn}
        </button>
        <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-accent-strong)]">
          {authMode === "firebase" ? "LIVE" : "DEMO"}
        </span>
      </div>

      <p className="mt-5 text-xs leading-5 text-[var(--color-ink-soft)]">{dictionary.demoHint}</p>
    </section>
  );
}
