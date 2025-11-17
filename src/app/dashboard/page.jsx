'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    console.log("Current status:", status);
    console.log("Session data:", session);

    // Wait until NextAuth loads
    if (status === "loading") {
      console.log("NextAuth is loading...");
      return;
    }

    // Not logged in → redirect to login page
    if (status === "unauthenticated") {
      console.log("User not authenticated, redirecting to signin...");
      router.replace("/signin");
      return;
    }

    // Token refresh failed → redirect to login
    if (session?.error === "RefreshAccessTokenError") {
      console.log("Token refresh failed, redirecting to signin...");
      // Sign out to clear the invalid session
      router.push("/api/auth/signout?callbackUrl=/signin");
      return;
    }

  }, [status, session, router]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // Show nothing while redirecting
  if (status === "unauthenticated" || session?.error) {
    return null;
  }

  // Authenticated view
  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to your Dashboard!</h1>
        {session?.user?.email && (
          <p className="text-gray-600">Logged in as: {session.user.email}</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Emails</h2>
        {emails.length === 0 ? (
          <p className="text-gray-500">No emails to display</p>
        ) : (
          <ul className="space-y-2">
            {emails.map((email, index) => (
              <li key={index} className="border-b pb-2">
                {email.subject || 'No subject'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}