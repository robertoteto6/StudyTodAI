import { nanoid } from "nanoid";
import { getAdminAuth } from "@/lib/firebase/admin";
import { type AuthUser } from "@/lib/types";

export async function requireRequestUser(request: Request): Promise<AuthUser> {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Missing authorization");
  }

  const token = authorization.slice("Bearer ".length);
  const adminAuth = getAdminAuth();

  if (adminAuth) {
    if (token.startsWith("demo:")) {
      throw new Error("Demo authentication is disabled");
    }

    const decoded = await adminAuth.verifyIdToken(token);

    return {
      id: decoded.uid,
      email: decoded.email ?? "unknown@example.com",
      name: decoded.name ?? decoded.email?.split("@")[0] ?? "Student",
      avatarUrl: decoded.picture,
      provider: "firebase",
    };
  }

  if (!token.startsWith("demo:")) {
    throw new Error("Firebase Admin is not configured");
  }

  const [, raw] = token.split("demo:");
  const [id, email, name] = raw?.split("|") ?? [];

  return {
    id: id || nanoid(),
    email: email || "demo@studytodai.local",
    name: name || "Demo Student",
    provider: "demo",
  };
}
