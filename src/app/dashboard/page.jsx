'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; 

export default function Dashboard() {
  const { status } = useSession();
  const router = useRouter(); 
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchEmails();
    }
  }, [status, router]);

  function fetchEmails() {
    console.log('Fetching emails...');
  }

  return (
    <div>
      {status === 'loading' && <p>Loading...</p>}
      {status === 'authenticated' && <p>Welcome to your Dashboard!</p>}
    </div>
  );
}
