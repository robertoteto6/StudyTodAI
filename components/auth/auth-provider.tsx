"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { nanoid } from "nanoid";
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

export function AuthProvider({
  children,
  firebaseEnabled,
}: {
  children: ReactNode;
  firebaseEnabled: boolean;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = firebaseEnabled ? getFirebaseAuth() : null;

  useEffect(() => {
    if (!auth) {
      startTransition(() => {
        setUser(readDemoUser());
        setLoading(false);
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        startTransition(() => {
          setUser(null);
          setLoading(false);
        });
        return;
      }

      startTransition(() => {
        setUser({
          id: nextUser.uid,
          email: nextUser.email ?? "unknown@example.com",
          name: nextUser.displayName ?? nextUser.email?.split("@")[0] ?? "Student",
          avatarUrl: nextUser.photoURL,
          provider: "firebase",
        });
        setLoading(false);
      });
    });

    return unsubscribe;
  }, [auth]);

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
        setUser(demoUser);
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
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
        setUser(demoUser);
        return;
      }

      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credentials.user, { displayName: name });
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
        setUser(demoUser);
        return;
      }

      await signInWithPopup(auth, new GoogleAuthProvider());
    },
    async signOut() {
      if (!auth) {
        writeDemoUser(null);
        setUser(null);
        return;
      }

      await firebaseSignOut(auth);
    },
    async getAuthorizationHeader() {
      if (!user) {
        return null;
      }

      if (!auth || user.provider === "demo") {
        return `Bearer demo:${user.id}|${user.email}|${user.name}`;
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
