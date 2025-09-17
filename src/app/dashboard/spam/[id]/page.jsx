'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function SpamEmailPage() {
  const { id } = useParams();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEmail() {
      try {
        const res = await fetch(`/api/gmail/email/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to fetch email');

        setEmail(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEmail();
  }, [id]);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (loading) return <div className="p-4">Loading email...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!email) return <div className="p-4 text-gray-500">Email not found</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{email.subject}</h1>
      
      <div className="text-sm text-gray-700 space-y-1 mb-4">
        <div><strong>From:</strong> {email.from}</div>
        <div><strong>To:</strong> {email.to}</div>
        <div><strong>Date:</strong> {formatDate(email.date)}</div>
      </div>

      {email.htmlBody ? (
        <div
          className="prose prose-sm"
          dangerouslySetInnerHTML={{ __html: email.htmlBody }}
        />
      ) : (
        <pre className="whitespace-pre-wrap font-sans">{email.textBody}</pre>
      )}

      {email.attachments && email.attachments.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Attachments</h2>
          <ul className="list-disc list-inside space-y-1">
            {email.attachments.map((attachment, index) => (
              <li key={index}>
                <a
                  href={`/api/gmail/attachment/${email.id}/${attachment.attachmentId}?mimeType=${encodeURIComponent(attachment.mimeType)}&filename=${encodeURIComponent(attachment.filename)}`}
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  {attachment.filename}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
