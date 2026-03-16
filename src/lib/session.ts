import { SessionOptions } from "iron-session";
import type { SessionData } from "./types";

export type { SessionData };

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "change-me-in-production-32-chars!!",
  cookieName: "yasenai_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};
