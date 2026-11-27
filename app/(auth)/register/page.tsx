import { Auth } from "@/components/auth/auth";

export default function Register() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Auth view="signUp" />
    </div>
  );
}
