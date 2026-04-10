import jwt from "jsonwebtoken";
import { env } from "../config/env";

type TokenType = "access" | "refresh";

export type TokenPayload = {
  userId: string;
  type: TokenType;
};

export const signAccessToken = (userId: string) =>
  jwt.sign({ userId, type: "access" } satisfies TokenPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m`
  });

export const signRefreshToken = (userId: string, expiresInDays: number) =>
  jwt.sign({ userId, type: "refresh" } satisfies TokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: `${expiresInDays}d`
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
