import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { ConfigService } from "@/services/ConfigService";

const OTP_TTL_MS = 10 * 60 * 1000;

async function getTwilioConfig() {
  const enabled = await ConfigService.get("sms_2fa_enabled");
  if (!enabled) return null;

  const dbSid = await ConfigService.get("twilio_account_sid") as string | null;
  const dbToken = await ConfigService.get("twilio_auth_token") as string | null;
  const dbPhone = await ConfigService.get("twilio_phone_number") as string | null;

  if (dbSid && dbToken && dbPhone) {
    return { accountSid: dbSid, authToken: dbToken, fromPhone: dbPhone };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromPhone) return null;
  return { accountSid, authToken, fromPhone };
}

export function generateOtpCode() {
  return String(randomInt(100000, 1000000));
}

export async function isSmsSandboxMode() {
  const enabled = await ConfigService.get("sms_2fa_enabled");
  if (!enabled) return false;
  return !!(await ConfigService.get("sms_sandbox_mode"));
}

export async function isSmsServiceConfigured() {
  if (await isSmsSandboxMode()) return true;
  return (await getTwilioConfig()) !== null;
}

export async function createOtpCode(userId: string) {
  const code = generateOtpCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MS);

  await prisma.$transaction([
    prisma.otpCode.deleteMany({
      where: {
        userId,
        used: false,
        expiresAt: { gt: now },
      },
    }),
    prisma.otpCode.create({
      data: {
        userId,
        code,
        expiresAt,
      },
    }),
  ]);

  return { code, expiresAt };
}

export async function sendOtpSms(phone: string, code: string) {
  const config = await getTwilioConfig();

  if (!config) {
    throw new Error("SMS service not configured");
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: phone,
        From: config.fromPhone,
        Body: `Tu código de verificación Details by MIMA es: ${code}`,
      }).toString(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to send SMS");
  }
}

export async function issueAndSendOtp(userId: string, phone: string) {
  const { code, expiresAt } = await createOtpCode(userId);
  await sendOtpSms(phone, code);
  return { expiresAt };
}
