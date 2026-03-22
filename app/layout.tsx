import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { hasFirebaseClientConfig } from "@/lib/firebase/env";
import { serverEnv } from "@/lib/server/env";

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyTodAI",
  description: "AI-first academic workspace for projects, notes, previews, and study conversations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const firebaseEnabled = serverEnv.isFirebaseConfigured && hasFirebaseClientConfig;

  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--color-canvas)] text-[var(--color-ink)]">
        <AuthProvider firebaseEnabled={firebaseEnabled}>{children}</AuthProvider>
      </body>
    </html>
  );
}
