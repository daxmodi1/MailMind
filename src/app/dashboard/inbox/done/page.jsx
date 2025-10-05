'use client';
import FetchEmails from '@/components/emailUI/fetch-emails';
export default function DonePage() {
  return (
    <FetchEmails type="inbox" subtype="done" />
  );
}