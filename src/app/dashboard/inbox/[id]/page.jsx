'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ShowEmailViaID from '@/components/emailUI/showEmail';

export default function SentEmailPage() {
  return (
    <ShowEmailViaID/>
  );
}
