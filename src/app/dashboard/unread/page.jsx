'use client';
import FetchEmails from '@/components/emailUI/fetch-emails';
export default function UnreadPage() {
  return (
    <FetchEmails type="inbox" subtype="unread" />
  );
}
