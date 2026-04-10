import { VerificationPurpose } from "@prisma/client";
import dayjs from "dayjs";
import { env } from "../config/env";
import { AppError } from "../utils/appError";
import { signAccessToken, signRefreshToken, verifyRefreshToken, type TokenPayload } from "../utils/jwt";
import { sendOtpEmail } from "../utils/mailer";
import { getOtpExpiry, generateOtpCode } from "../utils/otp";
import { comparePassword, hashPassword } from "../utils/password";
import { prisma } from "../utils/prisma";
import { sendOtpSms } from "../utils/sms";

type IdentifierInput = {
  email?: string | null;
  phone?: string | null;
};

type RegisterInput = IdentifierInput & {
  password: string;
  name: string;
};

type LoginInput = {
  identifier: string;
  password: string;
  rememberMe?: boolean;
};

const normalizeEmail = (value?: string | null) => value?.trim().toLowerCase() || null;
const normalizePhone = (value?: string | null) => value?.trim().replace(/\s+/g, "") || null;

const buildUserTarget = (identifier: string) => {
  if (identifier.includes("@")) {
    return { email: normalizeEmail(identifier), phone: null };
  }

  return { email: null, phone: normalizePhone(identifier) };
};

const serializeUser = (user: {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isVerified: boolean;
  profile: {
    carModel: string | null;
    carYear: number | null;
    licensePlate: string | null;
    defaultCommission: number;
    defaultCommissionUber: number;
    defaultCommissionCareem: number;
    defaultCommissionInDrive: number;
    defaultCommissionOther: number;
    defaultFuelCostKm: number;
    currency: string;
    notificationsEnabled: boolean;
    monthlyGoal: number;
    theme: string;
  } | null;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  isVerified: user.isVerified,
  profile: user.profile
});

const createTokens = async (userId: string, ttlInput: boolean | number = false) => {
  const accessToken = signAccessToken(userId);
  const refreshDays =
    typeof ttlInput === "number"
      ? ttlInput
      : ttlInput
        ? env.REMEMBER_ME_TTL_DAYS
        : env.REFRESH_TOKEN_TTL_DAYS;
  const refreshToken = signRefreshToken(userId, refreshDays);
  const expiresAt = dayjs().add(refreshDays, "day").toDate();

  await prisma.session.create({
    data: {
      userId,
      token: refreshToken,
      expiresAt
    }
  });

  return {
    accessToken,
    refreshToken,
    refreshExpiresAt: expiresAt.toISOString()
  };
};

const sendVerificationCode = async (
  userId: string,
  target: IdentifierInput,
  purpose: VerificationPurpose
) => {
  const code = generateOtpCode();

  await prisma.verificationCode.create({
    data: {
      userId,
      email: normalizeEmail(target.email),
      phone: normalizePhone(target.phone),
      purpose,
      code,
      expiresAt: getOtpExpiry()
    }
  });

  if (target.email) {
    await sendOtpEmail(target.email, code);
  }

  if (target.phone) {
    await sendOtpSms(target.phone, code);
  }
};

const getUserWithProfile = (userId: string) =>
  prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  });

export const registerUser = async ({ email, phone, password, name }: RegisterInput) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedEmail && !normalizedPhone) {
    throw new AppError("أدخل بريد إلكتروني أو رقم هاتف", 422, "IDENTIFIER_REQUIRED");
  }

  const conditions: Array<{ email?: string; phone?: string }> = [];
  if (normalizedEmail) {
    conditions.push({ email: normalizedEmail });
  }
  if (normalizedPhone) {
    conditions.push({ phone: normalizedPhone });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: conditions
    }
  });

  if (existingUser) {
    throw new AppError("المستخدم موجود بالفعل", 409, "USER_EXISTS");
  }

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash: await hashPassword(password),
      name,
      profile: {
        create: {}
      }
    },
    include: {
      profile: true
    }
  });

  await sendVerificationCode(
    user.id,
    { email: normalizedEmail, phone: normalizedPhone },
    VerificationPurpose.REGISTER
  );

  return {
    user: serializeUser(user),
    verificationTarget: normalizedEmail ?? normalizedPhone
  };
};

const verifyCode = async (
  identifier: string,
  code: string,
  purpose: VerificationPurpose
) => {
  const target = buildUserTarget(identifier);
  const conditions: Array<{ email?: string; phone?: string }> = [];
  if (target.email) {
    conditions.push({ email: target.email });
  }
  if (target.phone) {
    conditions.push({ phone: target.phone });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: conditions
    },
    include: { profile: true }
  });

  if (!user) {
    throw new AppError("المستخدم غير موجود", 404, "USER_NOT_FOUND");
  }

  const verificationCode = await prisma.verificationCode.findFirst({
    where: {
      userId: user.id,
      purpose,
      code,
      usedAt: null,
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!verificationCode) {
    throw new AppError("رمز التحقق غير صحيح أو منتهي", 400, "INVALID_OTP");
  }

  await prisma.verificationCode.update({
    where: { id: verificationCode.id },
    data: { usedAt: new Date() }
  });

  return user;
};

export const verifyRegistrationOtp = async (identifier: string, code: string) => {
  const user = await verifyCode(identifier, code, VerificationPurpose.REGISTER);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true },
    include: { profile: true }
  });

  const tokens = await createTokens(user.id, false);

  return {
    user: serializeUser(updatedUser),
    ...tokens
  };
};

export const loginUser = async ({ identifier, password, rememberMe = false }: LoginInput) => {
  const target = buildUserTarget(identifier);
  const conditions: Array<{ email?: string; phone?: string }> = [];
  if (target.email) {
    conditions.push({ email: target.email });
  }
  if (target.phone) {
    conditions.push({ phone: target.phone });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: conditions
    },
    include: { profile: true }
  });

  if (!user) {
    throw new AppError("بيانات الدخول غير صحيحة", 401, "INVALID_CREDENTIALS");
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError("بيانات الدخول غير صحيحة", 401, "INVALID_CREDENTIALS");
  }

  if (!user.isVerified) {
    throw new AppError("يجب تأكيد الحساب أولًا", 403, "ACCOUNT_NOT_VERIFIED");
  }

  const tokens = await createTokens(user.id, rememberMe);

  return {
    user: serializeUser(user),
    ...tokens
  };
};

export const refreshUserSession = async (refreshToken?: string) => {
  if (!refreshToken) {
    throw new AppError("رمز التحديث غير موجود", 401, "REFRESH_REQUIRED");
  }

  let payload: TokenPayload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("رمز التحديث غير صالح أو منتهي", 401, "INVALID_REFRESH_TOKEN");
  }

  if (payload.type !== "refresh") {
    throw new AppError("رمز التحديث غير صالح", 401, "INVALID_REFRESH_TOKEN");
  }

  const session = await prisma.session.findFirst({
    where: {
      token: refreshToken,
      userId: payload.userId,
      expiresAt: {
        gt: new Date()
      }
    }
  });

  if (!session) {
    throw new AppError("جلسة التحديث غير موجودة", 401, "SESSION_NOT_FOUND");
  }

  await prisma.session.delete({
    where: { id: session.id }
  });

  const user = await getUserWithProfile(payload.userId);

  if (!user) {
    throw new AppError("المستخدم غير موجود", 404, "USER_NOT_FOUND");
  }

  const remainingDays = Math.max(1, dayjs(session.expiresAt).diff(dayjs(), "day"));
  const tokens = await createTokens(payload.userId, remainingDays);

  return {
    user: serializeUser(user),
    ...tokens
  };
};

export const logoutUser = async (refreshToken?: string) => {
  if (!refreshToken) {
    return;
  }

  await prisma.session.deleteMany({
    where: {
      token: refreshToken
    }
  });
};

export const forgotPassword = async (identifier: string) => {
  const target = buildUserTarget(identifier);
  const conditions: Array<{ email?: string; phone?: string }> = [];
  if (target.email) {
    conditions.push({ email: target.email });
  }
  if (target.phone) {
    conditions.push({ phone: target.phone });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: conditions
    }
  });

  if (!user) {
    throw new AppError("المستخدم غير موجود", 404, "USER_NOT_FOUND");
  }

  await sendVerificationCode(user.id, target, VerificationPurpose.RESET_PASSWORD);
};

export const resetPassword = async (identifier: string, code: string, password: string) => {
  const user = await verifyCode(identifier, code, VerificationPurpose.RESET_PASSWORD);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(password)
    }
  });

  await prisma.session.deleteMany({
    where: { userId: user.id }
  });
};

export const getCurrentUser = async (userId: string) => {
  const user = await getUserWithProfile(userId);

  if (!user) {
    throw new AppError("المستخدم غير موجود", 404, "USER_NOT_FOUND");
  }

  return serializeUser(user);
};

export const deleteUserAccount = async (userId: string) => {
  await prisma.user.delete({
    where: { id: userId }
  });
};
