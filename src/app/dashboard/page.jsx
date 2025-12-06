'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  EmailStatsChart, 
  processEmailsToDaily 
} from '@/components/dashboardUI/EmailStatsChart';
import { Spinner } from '@/components/ui/spinner';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [emails, setEmails] = useState([]);
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      console.log("User not authenticated, redirecting to login...");
      router.replace("/login");
      return;
    }

    // Token refresh failed → redirect to login
    if (session?.error === "RefreshAccessTokenError") {
      console.log("Token refresh failed, redirecting to signin...");
      // Sign out to clear the invalid session
      router.push("/api/auth/signout?callbackUrl=/login");
      return;
    }

    // Fetch emails for chart data (both inbox and sent)
    const fetchEmails = async () => {
      try {
        setLoading(true);
        
        // Fetch both inbox and sent emails in parallel
        const [inboxResponse, sentResponse] = await Promise.all([
          fetch('/api/gmail?type=inbox&maxResults=100'),
          fetch('/api/gmail?type=sent&maxResults=100')
        ]);
        
        let allEmails = [];
        
        if (inboxResponse.ok) {
          const inboxData = await inboxResponse.json();
          const inboxEmails = (inboxData.emails || inboxData || []).map(email => ({
            ...email,
            _type: 'received'
          }));
          allEmails = [...allEmails, ...inboxEmails];
        }
        
        if (sentResponse.ok) {
          const sentData = await sentResponse.json();
          const sentEmails = (sentData.emails || sentData || []).map(email => ({
            ...email,
            labelIds: [...(email.labelIds || []), 'SENT'],
            _type: 'sent'
          }));
          allEmails = [...allEmails, ...sentEmails];
        }
        
        setEmails(allEmails.filter(e => e._type === 'received').slice(0, 10));
        
        // Process all emails into chart data
        if (allEmails.length > 0) {
          setDailyData(processEmailsToDaily(allEmails));
        }
      } catch (error) {
        console.error('Failed to fetch emails for stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchEmails();
    }

  }, [status, session, router]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Spinner className="size-8" />
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
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session?.user?.name || session?.user?.email?.split('@')[0] || 'User'}!
        </h1>
      </div>

      {/* Email Statistics Chart */}
      <div className="mb-8">
        {loading ? (
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6 h-[380px] flex items-center justify-center">
            <Spinner className="size-8" />
          </div>
        ) : dailyData ? (
          <EmailStatsChart 
            data={dailyData} 
            title="Daily Email Activity" 
            description="Your email activity for the last 7 days"
            timeRange="daily"
          />
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6 h-[380px] flex items-center justify-center text-gray-500">
            No email activity data available
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Emails</h2>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner className="size-6" />
          </div>
        ) : emails.length === 0 ? (
          <p className="text-gray-500">No emails to display</p>
        ) : (
          <ul className="space-y-2">
            {emails.slice(0, 10).map((email, index) => (
              <li 
                key={email.id || index} 
                className="border-b pb-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 p-2 rounded-md transition-colors"
                onClick={() => router.push(`/dashboard/inbox/${email.id}`)}
              >
                <span className="font-medium">{email.subject || 'No subject'}</span>
                <span className="text-gray-500 text-sm ml-2">from {email.from}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}