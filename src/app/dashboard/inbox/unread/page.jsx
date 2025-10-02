'use client';
import FetchEmailSubtype from '@/components/emailUI/fetchEmailSubtype';
export default function UnreadPage() {
  return (
    <FetchEmailSubtype type="inbox" subtype="unread" />
  );
}
