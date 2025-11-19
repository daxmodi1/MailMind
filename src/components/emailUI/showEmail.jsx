'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ShowEmailViaID({ page }) {
  const { id } = useParams();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

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

  const handleSummarize = async () => {
    if (!email) return;
    
    setSummarizing(true);
    setSummaryError(null);
    
    try {
      const emailContent = email.htmlBody || email.textBody || '';
      
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailContent: emailContent
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to summarize email');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      setSummaryError(err.message);
      console.error('Summarization error:', err);
    } finally {
      setSummarizing(false);
    }
  };

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

        {/* Summarize Button */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={handleSummarize}
            disabled={summarizing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {summarizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Summarizing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                </svg>
                <span>Summarise this email</span>
              </>
            )}
          </button>
        </div>

        {/* AI Summary Section - Like Gmail */}
        {summary && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.5.734v8.5c0 .41.336.75.75.75h8.5a.75.75 0 00.75-.75v-4.5a.75.75 0 011.5 0v4.5A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h4.5a.75.75 0 010 1.5h-4.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span>AI Overview</span>
                  <span className="text-xs text-gray-600 font-normal">(by Gemini)</span>
                </h3>
                <div className="text-sm text-blue-900 space-y-1">
                  {summary.split('\n').filter(line => line.trim()).map((line, index) => {
                    // Handle bullet points
                    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                      return (
                        <div key={index} className="flex gap-2">
                          <span className="flex-shrink-0">•</span>
                          <span>{line.replace(/^[•-]\s*/, '')}</span>
                        </div>
                      );
                    }
                    return <div key={index}>{line}</div>;
                  })}
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  <span>By Mailmind; there may be mistakes. </span>
                  <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                </div>
              </div>
              <button
                onClick={() => setSummary(null)}
                className="flex-shrink-0 text-blue-600 hover:text-blue-700 p-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {summaryError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-700">
              <strong>Summary Error:</strong> {summaryError}
            </div>
          </div>
        )}

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
