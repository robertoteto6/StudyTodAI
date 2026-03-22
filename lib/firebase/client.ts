import { getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { firebaseClientConfig, hasFirebaseClientConfig } from "@/lib/firebase/env";

export function getFirebaseApp() {
  if (!hasFirebaseClientConfig) {
    return null;
  }

  return getApps()[0] ?? initializeApp(firebaseClientConfig);
}

export function getFirebaseAuth() {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export function getGoogleProvider() {
  return new GoogleAuthProvider();
}
