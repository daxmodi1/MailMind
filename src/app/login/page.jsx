import { LoginForm } from "@/components/login-form"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata = {
  title: 'Login',
  description: 'Sign in to your MailMind account',
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  
  // If authenticated, redirect immediately (server-side, no lag)
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div
      className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
