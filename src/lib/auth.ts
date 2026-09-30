import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fixora-dev-secret-change-in-production"
);

export const SESSION_COOKIE = "fixora_session";

export type UserRole = "ADMIN" | "TECHNICIAN" | "CUSTOMER";

export type SessionUser = {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
};

export async function createSessionToken(user: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}) {
  return new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub || !payload.email || !payload.role) return null;
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: (payload.name as string) ?? "",
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireRole(...roles: UserRole[]): Promise<SessionUser> {
  const user = await getSession();
  if (!user || !roles.includes(user.role)) {
    throw new AuthError("Unauthorized");
  }
  return user;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}