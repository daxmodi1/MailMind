'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ShowEmailViaID({ page }) {
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

  // --- Helper: rewrite links to open outside sandbox ---
  function rewriteLinks(html) {
    if (!html) return "";
    return html.replace(/<a\s/gi, '<a target="_blank" rel="noopener noreferrer" ');
  }

  // --- Listen for iframe resize messages ---
  useEffect(() => {
    const handler = (event) => {
      if (event.data?.type === 'resizeEmailIframe') {
        const iframe = document.getElementById('email-iframe');
        if (iframe) {
          iframe.style.height = event.data.height + 'px';
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (loading) return <div className="p-4">Loading email...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!email) return <div className="p-4 text-gray-500">Email not found</div>;

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{email.subject}</h1>

        <div className="text-sm text-gray-700 space-y-1 mb-4">
          <div>
            <strong>From:</strong> {email.from}
          </div>
          <div>
            <strong>To:</strong> {email.to}
          </div>
          <div>
            <strong>Date:</strong> {formatDate(email.date)}
          </div>
        </div>

        {/* Email Content - sandboxed, auto-resizing */}
        <div className="border rounded-lg bg-white mb-6">
          {email.htmlBody ? (
            <iframe
              id="email-iframe"
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                      body {
                        margin: 16px;
                        font-family: system-ui, -apple-system, sans-serif;
                      }
                      img {
                        max-width: 100%;
                        height: auto;
                      }
                    </style>
                  </head>
                  <body>
                    ${rewriteLinks(email.htmlBody)}
                    <script>
                      function sendHeight() {
                        const height = document.body.scrollHeight;
                        parent.postMessage({ type: 'resizeEmailIframe', height }, '*');
                      }
                      window.onload = sendHeight;
                      window.onresize = sendHeight;
                      // Some emails load images late
                      setTimeout(sendHeight, 500);
                      setTimeout(sendHeight, 1500);
                    </script>
                  </body>
                </html>
              `}
              className="w-full border-0"
              style={{ minHeight: '500px', height: 'auto' }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
              title="Email content"
            />
          ) : (
            <pre className="whitespace-pre-wrap font-sans p-4">
              {email.textBody}
            </pre>
          )}
        </div>

        {email.attachments && email.attachments.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Attachments</h2>
            <ul className="list-disc list-inside space-y-1">
              {email.attachments.map((attachment, index) => (
                <li key={index}>
                  <a
                    href={`/api/gmail/attachment/${email.id}/${attachment.attachmentId}?mimeType=${encodeURIComponent(
                      attachment.mimeType
                    )}&filename=${encodeURIComponent(attachment.filename)}`}
                    target="_blank"
                    rel="noopener noreferrer"
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
    </div>
  );
}
