import { z } from "zod";
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { AUTH_SESSION_COOKIE_NAME } from "@/lib/auth/shared";
import {
  getSessionCookieOptions,
  verifySessionToken,
} from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";

const sessionSchema = z.object({
  demoToken: z.string().min(1).optional(),
  idToken: z.string().min(1).optional(),
});

const FIREBASE_SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 5;

export async function POST(request: Request) {
  try {
    const payload = sessionSchema.parse(await request.json());
    const adminAuth = getAdminAuth();
    const response = NextResponse.json({ ok: true });

    if (adminAuth) {
      if (!payload.idToken) {
        return jsonError("Missing Firebase session token", 400);
      }

      await adminAuth.verifyIdToken(payload.idToken);
      const sessionCookie = await adminAuth.createSessionCookie(payload.idToken, {
        expiresIn: FIREBASE_SESSION_MAX_AGE_MS,
      });
      response.cookies.set(
        AUTH_SESSION_COOKIE_NAME,
        sessionCookie,
        getSessionCookieOptions("firebase"),
      );
      return response;
    }

    if (!payload.demoToken) {
      return jsonError("Missing demo session token", 400);
    }

    await verifySessionToken(payload.demoToken);
    response.cookies.set(
      AUTH_SESSION_COOKIE_NAME,
      payload.demoToken,
      getSessionCookieOptions("demo"),
    );
    return response;
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to create session",
      400,
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions("firebase"),
    maxAge: 0,
  });
  return response;
}
