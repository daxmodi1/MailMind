'use client'
import { GalleryVerticalEnd } from "lucide-react"
import CustomButton from "./home/custom-btn"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signIn } from 'next-auth/react';
import Image from "next/image";
export function LoginForm({
  className,
  ...props
}) {
  const handleSignIn = async () => {
    try {
      // Starting Google sign in
      // Sign in with Google
      await signIn("google", { callbackUrl: "/dashboard", redirect: true });
    } catch (error) {
      // Sign in error occurred
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a href="#" className="flex flex-col items-center gap-2 font-medium">
                <Image src="/logo.png" width={60} height={60} alt="logo" />
              <span className="sr-only">MailMind.AI</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to MailMind.AI</h1>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </Field>
          <Field>
            <Button type="submit">Login</Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field className="flex">
            <CustomButton onClick={handleSignIn} className="w-full">
              <Image src="/icons/gmail.svg" width={30} height={30} alt="gmailIcon" />
              <span className="text-base pl-2">Login With Gmail</span>
            </CustomButton>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>{" "}
        and{" "}
        <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
