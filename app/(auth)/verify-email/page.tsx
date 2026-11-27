import { Auth } from "@/components/auth/auth";

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Auth view="verifyEmail" />
    </div>
  );
}
