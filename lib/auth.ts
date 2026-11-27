import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { prisma } from "@/lib/db";
import { sendAuthEmail } from "@/lib/email";

const socialProviders = {
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
  // ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
  //   ? {
  //       github: {
  //         clientId: process.env.GITHUB_CLIENT_ID,
  //         clientSecret: process.env.GITHUB_CLIENT_SECRET
  //       }
  //     }
  //   : {})
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendResetPassword({ user, url }) {
      await sendAuthEmail({
        to: user.email,
        subject: "Reset your password",
        heading: "Reset your password",
        description: "Click the button below to set a new password.",
        actionLabel: "Reset Password",
        url,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      await sendAuthEmail({
        to: user.email,
        subject: "Verify your email address",
        heading: "Verify your email address",
        description: "Click the button below to verify your email address.",
        actionLabel: "Verify Email",
        url,
      });
    },
  },
  ...(Object.keys(socialProviders).length > 0 ? { socialProviders } : {}),
  plugins: [nextCookies()],
});
