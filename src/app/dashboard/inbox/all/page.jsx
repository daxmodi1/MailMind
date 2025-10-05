'use client'
import FetchEmails from '@/components/emailUI/fetch-emails';
export default function AllPage() {
  return (
    <FetchEmails type="inbox" subtype="all" />
  );
}
 