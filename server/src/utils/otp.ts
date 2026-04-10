import { createHash, randomInt } from "crypto";
import dayjs from "dayjs";
import { env } from "../config/env";

export const generateOtpCode = (): string => randomInt(100000, 1000000).toString();

export const hashOtpCode = (code: string): string =>
  createHash("sha256").update(code).digest("hex");

export const getOtpExpiry = (): Date =>
  dayjs().add(env.OTP_TTL_MINUTES, "minute").toDate();
