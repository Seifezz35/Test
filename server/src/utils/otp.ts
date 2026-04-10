import dayjs from "dayjs";
import { env } from "../config/env";

export const generateOtpCode = () => Math.floor(100000 + Math.random() * 900000).toString();
export const getOtpExpiry = () => dayjs().add(env.OTP_TTL_MINUTES, "minute").toDate();
