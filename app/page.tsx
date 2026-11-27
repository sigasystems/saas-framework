"use client";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function Home() {
  const navigate = useRouter();
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between bg-white px-16 py-32 sm:items-start dark:bg-black">
        React Saas Starter
        <div className="flex flex-1 items-center">
          <Button onClick={() => navigate.push("/login")}>Login</Button>
          <Button onClick={() => navigate.push("/register")}>Register</Button>
          <Button onClick={() => navigate.push("/forgotpass")}>Forgot Pass</Button>
          <Button onClick={() => navigate.push("/resetpass")}>Reset Pass</Button>
        </div>
      </main>
    </div>
  );
}
