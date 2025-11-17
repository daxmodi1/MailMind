'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If session has error, sign out first to clear it
    if (session?.error === "RefreshAccessTokenError") {
      console.log("Clearing invalid session...");
      signOut({ redirect: false });
    }
    
    // If authenticated without errors, redirect to dashboard
    if (status === 'authenticated' && !session?.error) {
      router.replace('/dashboard');
    }
  }, [status, session, router]);

  const handleSignIn = async () => {
    try {
      // Clear any existing invalid session first
      await signOut({ redirect: false });
      
      // Sign in with Google
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {session?.error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 text-sm">
              Your session has expired. Please sign in again.
            </p>
          </div>
        )}
        
        <button 
          className="backdrop-blur-[2px] w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-black border border-white/10 rounded-full py-3 px-4 transition-colors"
          onClick={handleSignIn}
        >
          <span className="text-lg">G</span>
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
}