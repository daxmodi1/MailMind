'use client';

import FetchEmails from '@/components/emailUI/fetch-emails';
import { AutoDeleteBadge } from '@/components/emailUI/warningBadge';
export default function SpamPage() {
  return (
    <div>
      <FetchEmails type="spam" />
    </div>
  );
}