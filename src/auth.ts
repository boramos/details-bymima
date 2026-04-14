import NextAuth from "next-auth";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { issueAndSendOtp, isSmsServiceConfigured, isSmsSandboxMode, createOtpCode } from "@/lib/two-factor";
import { UserService } from "@/services/UserService";

export type UserRole = "admin" | "customer";

class TwoFactorRequiredError extends CredentialsSignin {
  code = "two_factor_required";
}

class SmsNotConfiguredError extends CredentialsSignin {
  code = "sms_not_configured";
}

declare module "next-auth" {
  interface User {
    role?: UserRole;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}

async function validateCredentials(
  email: string,
  password: string,
): Promise<{ id: string; name: string; email: string; role: UserRole } | null> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (adminEmail && adminPasswordHash && email.toLowerCase() === adminEmail.toLowerCase()) {
    const valid = await bcrypt.compare(password, adminPasswordHash);
    if (valid) {
      return { id: "admin", name: "MIMA", email: adminEmail, role: "admin" };
    }
  }

  const user = await UserService.getUserByEmail(email);
  if (!user || !user.passwordHash) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    name: user.name || "",
    email: user.email,
    role: user.role === "ADMIN" ? "admin" : "customer",
  };
}

function formatAuthorizedUser(user: {
  id: string;
  name?: string | null;
  email: string;
  role: string;
}) {
  return {
    id: user.id,
    name: user.name || "",
    email: user.email,
    role: user.role === "ADMIN" ? "admin" : "customer",
  } satisfies { id: string; name: string; email: string; role: UserRole };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Apple({
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET,
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        if (typeof credentials?.email !== "string") {
          return null;
        }

        if (typeof credentials.twoFactorCode === "string") {
          const user = await UserService.getUserByEmail(credentials.email);

          if (!user || !user.twoFactorEnabled) {
            return null;
          }

          const otp = await prisma.otpCode.findFirst({
            where: {
              userId: user.id,
              used: false,
              expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
          });

          if (!otp || otp.code !== credentials.twoFactorCode) {
            return null;
          }

          await prisma.otpCode.update({
            where: { id: otp.id },
            data: { used: true },
          });

          return formatAuthorizedUser(user);
        }

        if (typeof credentials.password !== "string") {
          return null;
        }

        const authorizedUser = await validateCredentials(credentials.email, credentials.password);

        if (!authorizedUser) {
          return null;
        }

        if (authorizedUser.id === "admin") {
          return authorizedUser;
        }

        const dbUser = await UserService.getUserByEmail(credentials.email);

        if (dbUser?.twoFactorEnabled && dbUser.twoFactorPhone) {
          if (!await isSmsServiceConfigured()) {
            throw new SmsNotConfiguredError();
          }

          if (await isSmsSandboxMode()) {
            await createOtpCode(dbUser.id);
          } else {
            await issueAndSendOtp(dbUser.id, dbUser.twoFactorPhone);
          }
          throw new TwoFactorRequiredError();
        }

        return authorizedUser;
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: (token.role ?? "customer") as UserRole,
        },
      };
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
  },
});
