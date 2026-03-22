import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import {
  AUTH_SESSION_COOKIE_NAME,
  parseDemoSessionToken,
} from "@/lib/auth/shared";
import { type AuthUser } from "@/lib/types";

const FIREBASE_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;
const DEMO_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function toAuthUserFromFirebase(decoded: {
  uid: string;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
}): AuthUser {
  return {
    id: decoded.uid,
    email: decoded.email ?? "unknown@example.com",
    name: decoded.name ?? decoded.email?.split("@")[0] ?? "Student",
    avatarUrl: decoded.picture,
    provider: "firebase",
  };
}

function getBearerToken(authorization: string | null) {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
}

export function getSessionCookieOptions(provider: "firebase" | "demo") {
  return {
    httpOnly: true,
    maxAge:
      provider === "firebase"
        ? FIREBASE_SESSION_MAX_AGE_SECONDS
        : DEMO_SESSION_MAX_AGE_SECONDS,
    path: "/",
    priority: "high" as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function verifySessionToken(token: string): Promise<AuthUser> {
  const adminAuth = getAdminAuth();

  if (adminAuth) {
    if (token.startsWith("demo:")) {
      throw new Error("Demo authentication is disabled");
    }

    try {
      const decoded = await adminAuth.verifySessionCookie(token);
      return toAuthUserFromFirebase(decoded);
    } catch {
      const decoded = await adminAuth.verifyIdToken(token);
      return toAuthUserFromFirebase(decoded);
    }
  }

  const demoUser = parseDemoSessionToken(token);

  return {
    ...demoUser,
    provider: "demo",
  };
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getSessionUser() {
  const token = await getSessionToken();

  if (!token) {
    return null;
  }

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireRequestUser(request: Request): Promise<AuthUser> {
  const token = getBearerToken(request.headers.get("authorization")) ?? (await getSessionToken());

  if (!token) {
    throw new Error("Missing authorization");
  }

  return verifySessionToken(token);
}
