export const AUTH_SESSION_COOKIE_NAME = "studytodai.session";

type DemoSessionUser = {
  id: string;
  email: string;
  name: string;
};

function encodeTokenPart(value: string) {
  return encodeURIComponent(value);
}

function decodeTokenPart(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function createDemoSessionToken(user: DemoSessionUser) {
  return `demo:${[user.id, user.email, user.name].map(encodeTokenPart).join("|")}`;
}

export function parseDemoSessionToken(token: string): DemoSessionUser {
  if (!token.startsWith("demo:")) {
    throw new Error("Invalid demo session");
  }

  const [id = "", email = "", name = ""] = token
    .slice("demo:".length)
    .split("|")
    .map(decodeTokenPart);

  return {
    id: id || "demo-user",
    email: email || "demo@studytodai.local",
    name: name || "Demo Student",
  };
}
