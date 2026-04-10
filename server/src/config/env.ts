import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(7),
  REMEMBER_ME_TTL_DAYS: z.coerce.number().default(30),
  OTP_TTL_MINUTES: z.coerce.number().default(10),
  OTP_FROM_EMAIL: z.string().default("noreply@captainprofit.app"),
  OTP_FROM_SMS: z.string().default("CaptainProfit"),
  RESEND_API_KEY: z.string().min(1),
  CORS_ORIGIN: z.string().default("http://localhost:5173")
});

export const env = envSchema.parse(process.env);
