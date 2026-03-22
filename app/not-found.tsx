export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-ink-soft)]">404</p>
      <h1 className="display-text mt-4 text-5xl">Page not found</h1>
      <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
        The requested route does not exist or the locale segment is invalid.
      </p>
    </main>
  );
}
