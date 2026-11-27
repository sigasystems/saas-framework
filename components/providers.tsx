"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { QueryClientProvider } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/query-client";

import { AuthProvider } from "./auth/auth-provider";
import { Toaster } from "./ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        authClient={authClient}
        baseURL={process.env.NEXT_PUBLIC_APP_URL ?? ""}
        basePaths={{ auth: "" }}
        viewPaths={{
          auth: {
            signIn: "login",
            signUp: "register",
            forgotPassword: "forgotpass",
            resetPassword: "resetpass",
          },
        }}
        redirectTo="/dashboard"
        socialProviders={["google"]}
        emailAndPassword={{ enabled: true, requireEmailVerification: true }}
        navigate={({ to, replace }) => {
          if (replace) {
            router.replace(to);
          } else {
            router.push(to);
          }
        }}
        Link={Link}
      >
        {children}

        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
