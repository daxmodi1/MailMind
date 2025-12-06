'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  EmailStatsChart, 
  processEmailsToDaily, 
  processEmailsToWeekly,
  demoDailyData,
  demoWeeklyData 
} from '@/components/dashboardUI/EmailStatsChart';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [emails, setEmails] = useState([]);
  const [dailyData, setDailyData] = useState(demoDailyData);
  const [weeklyData, setWeeklyData] = useState(demoWeeklyData);
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

    // Fetch emails for chart data
    const fetchEmails = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/gmail?maxResults=100');
        if (response.ok) {
          const data = await response.json();
          const emailList = data.emails || [];
          setEmails(emailList);
          
          // Process emails into chart data
          if (emailList.length > 0) {
            setDailyData(processEmailsToDaily(emailList));
            setWeeklyData(processEmailsToWeekly(emailList));
          }
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
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session?.user?.name || session?.user?.email?.split('@')[0] || 'User'}!
        </h1>
      </div>

      {/* Email Statistics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <EmailStatsChart 
          data={dailyData} 
          title="Daily Email Activity" 
          description="Your email activity for the last 7 days"
          timeRange="daily"
        />
        <EmailStatsChart 
          data={weeklyData} 
          title="Weekly Email Activity" 
          description="Your email activity for the last 4 weeks"
          timeRange="weekly"
        />
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Emails</h2>
        {loading ? (
          <p className="text-gray-500">Loading emails...</p>
        ) : emails.length === 0 ? (
          <p className="text-gray-500">No emails to display</p>
        ) : (
          <ul className="space-y-2">
            {emails.slice(0, 10).map((email, index) => (
              <li 
                key={email.id || index} 
                className="border-b pb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 p-2 rounded-md transition-colors"
                onClick={() => router.push(`/dashboard/inbox?emailId=${email.id}`)}
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