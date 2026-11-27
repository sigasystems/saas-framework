"use client";

import { useRouter } from "next/navigation";

import { useAuthenticate } from "@better-auth-ui/react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export default function Dashboard() {
  const router = useRouter();
  const { data: session } = useAuthenticate(authClient);

  if (!session) {
    return (
      <div className="my-auto flex justify-center">
        <Spinner color="current" />
      </div>
    );
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.replace("/login");
  }

  return (
    <div className="my-auto flex flex-col items-center gap-4">
      <h1 className="text-2xl">Hello, {session.user.email}</h1>

      <Button variant="outline" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  );
}
