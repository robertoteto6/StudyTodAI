"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  useCallback,
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { nanoid } from "nanoid";
import { AUTH_SESSION_COOKIE_NAME, createDemoSessionToken } from "@/lib/auth/shared";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { safeJsonParse } from "@/lib/utils";
import { type AuthUser } from "@/lib/types";

const DEMO_USER_STORAGE_KEY = "studytodai.demo.user";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  authMode: "firebase" | "demo";
  signInWithEmail(email: string, password: string): Promise<void>;
  signUpWithEmail(name: string, email: string, password: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  getAuthorizationHeader(): Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readDemoUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(DEMO_USER_STORAGE_KEY);
  return value ? safeJsonParse<AuthUser | null>(value, null) : null;
}

function writeDemoUser(user: AuthUser | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user));
}

function toAuthUser(nextUser: User): AuthUser {
  return {
    id: nextUser.uid,
    email: nextUser.email ?? "unknown@example.com",
    name: nextUser.displayName ?? nextUser.email?.split("@")[0] ?? "Student",
    avatarUrl: nextUser.photoURL,
    provider: "firebase",
  };
}

export function AuthProvider({
  children,
  firebaseEnabled,
}: {
  children: ReactNode;
  firebaseEnabled: boolean;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const lastSessionTokenRef = useRef<string | null>(null);
  const auth = firebaseEnabled ? getFirebaseAuth() : null;

  const syncServerSession = useCallback(
    async (payload: { demoToken?: string; idToken?: string } | null) => {
      const nextToken = payload?.idToken ?? payload?.demoToken ?? null;

      if (lastSessionTokenRef.current === nextToken) {
        return;
      }

      const response = await fetch("/api/auth/session", {
        method: payload ? "POST" : "DELETE",
        headers: payload ? { "Content-Type": "application/json" } : undefined,
        body: payload ? JSON.stringify(payload) : undefined,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Unable to sync session");
      }

      lastSessionTokenRef.current = nextToken;
    },
    [],
  );

  const syncFirebaseSession = useCallback(async (nextUser: User) => {
    const idToken = await nextUser.getIdToken();
    await syncServerSession({ idToken });
    return idToken;
  }, [syncServerSession]);

  const syncDemoSession = useCallback(async (nextUser: AuthUser | null) => {
    await syncServerSession(
      nextUser
        ? {
            demoToken: createDemoSessionToken(nextUser),
          }
        : null,
    );
  }, [syncServerSession]);

  useEffect(() => {
    let isActive = true;

    if (!auth) {
      const demoUser = readDemoUser();

      void syncDemoSession(demoUser)
        .catch(() => {
          window.document.cookie = `${AUTH_SESSION_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
          lastSessionTokenRef.current = null;
        })
        .finally(() => {
          if (!isActive) {
            return;
          }

          startTransition(() => {
            setUser(demoUser);
            setLoading(false);
          });
        });

      return () => {
        isActive = false;
      };
    }

    const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
      if (!isActive) {
        return;
      }

      try {
        if (!nextUser) {
          await syncServerSession(null);
          if (!isActive) {
            return;
          }

          startTransition(() => {
            setUser(null);
            setLoading(false);
          });
          return;
        }

        await syncFirebaseSession(nextUser);

        if (!isActive) {
          return;
        }

        startTransition(() => {
          setUser(toAuthUser(nextUser));
          setLoading(false);
        });
      } catch {
        if (!isActive) {
          return;
        }

        startTransition(() => {
          setLoading(false);
        });
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [auth, syncDemoSession, syncFirebaseSession, syncServerSession]);

  const value: AuthContextValue = {
    user,
    loading,
    authMode: firebaseEnabled ? "firebase" : "demo",
    async signInWithEmail(email, password) {
      if (!auth) {
        const demoUser: AuthUser = {
          id: nanoid(),
          email,
          name: email.split("@")[0],
          provider: "demo",
        };
        writeDemoUser(demoUser);
        await syncDemoSession(demoUser);
        setUser(demoUser);
        return;
      }

      const credentials = await signInWithEmailAndPassword(auth, email, password);
      await syncFirebaseSession(credentials.user);
    },
    async signUpWithEmail(name, email, password) {
      if (!auth) {
        const demoUser: AuthUser = {
          id: nanoid(),
          email,
          name,
          provider: "demo",
        };
        writeDemoUser(demoUser);
        await syncDemoSession(demoUser);
        setUser(demoUser);
        return;
      }

      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credentials.user, { displayName: name });
      await syncFirebaseSession(credentials.user);
    },
    async signInWithGoogle() {
      if (!auth) {
        const demoUser: AuthUser = {
          id: nanoid(),
          email: "demo@studytodai.local",
          name: "Demo Student",
          provider: "demo",
        };
        writeDemoUser(demoUser);
        await syncDemoSession(demoUser);
        setUser(demoUser);
        return;
      }

      const credentials = await signInWithPopup(auth, new GoogleAuthProvider());
      await syncFirebaseSession(credentials.user);
    },
    async signOut() {
      if (!auth) {
        writeDemoUser(null);
        await syncDemoSession(null);
        setUser(null);
        return;
      }

      await syncServerSession(null);
      await firebaseSignOut(auth);
    },
    async getAuthorizationHeader() {
      if (!user) {
        return null;
      }

      if (!auth || user.provider === "demo") {
        return `Bearer ${createDemoSessionToken(user)}`;
      }

      const token = await auth.currentUser?.getIdToken();
      return token ? `Bearer ${token}` : null;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
