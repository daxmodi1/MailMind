'use client'
import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <button className="backdrop-blur-[2px] w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-black border border-white/10 rounded-full py-3 px-4 transition-colors"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
      <span className="text-lg">G</span>
      <span>Sign in with Google</span>
    </button>
  )
}