export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for MailMind - Learn how we protect your data and privacy.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-4">Last updated: December 7, 2025</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">🔒 Google User Data Protection</h3>
            <p className="text-blue-800 text-sm">
              MailMind's use of information received from Gmail APIs will adhere to 
              <a href="https://developers.google.com/terms/api-services-user-data-policy" className="underline hover:text-blue-600" target="_blank" rel="noopener noreferrer">
                Google API Services User Data Policy
              </a>, including the Limited Use requirements. Your Gmail data is never sold, used for advertising, or shared without your consent.
            </p>
          </div>
        </div>

        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              MailMind ("we," "our," or "us") respects your privacy and is committed to protecting your personal 
              information. This Privacy Policy explains how we collect, use, disclose, and safeguard your 
              information when you use our AI-powered email management service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Google Account Information:</strong> When you sign in, we receive basic profile information (name, email address, profile picture) from Google OAuth</li>
                <li><strong>Gmail Data:</strong> We access your Gmail emails, including content, metadata, labels, and attachments to provide our services</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-3">2.2 Information Automatically Collected</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Usage Data:</strong> Information about how you interact with our service</li>
                <li><strong>Log Data:</strong> IP address, browser type, operating system, and timestamps</li>
                <li><strong>Session Data:</strong> Temporary authentication tokens for service functionality</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Service Provision:</strong> To display, organize, and manage your emails</li>
                <li><strong>AI Summarization:</strong> To generate intelligent summaries of your email content</li>
                <li><strong>Search Functionality:</strong> To enable smart search across your email data</li>
                <li><strong>Analytics:</strong> To provide email statistics and insights about your usage patterns</li>
                <li><strong>Service Improvement:</strong> To enhance and optimize our service performance</li>
                <li><strong>Authentication:</strong> To verify your identity and maintain secure sessions</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Google User Data Usage</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-3">4.1 Gmail API Scope and Purpose</h3>
              <p className="text-gray-700 leading-relaxed">
                MailMind requests access to your Gmail data through the following Google API scopes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
                <li><strong>gmail.readonly:</strong> To read your email messages and metadata for display and search</li>
                <li><strong>gmail.modify:</strong> To mark emails as read/unread, archive, delete, and organize</li>
                <li><strong>gmail.send:</strong> To send emails and replies on your behalf</li>
                <li><strong>userinfo.email & userinfo.profile:</strong> For authentication and account identification</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-3">4.2 Limited Use Compliance</h3>
              <p className="text-gray-700 leading-relaxed">
                MailMind's use of information received from Gmail APIs adheres to 
                <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-blue-600 hover:underline">
                  Google API Services User Data Policy
                </a>, including the Limited Use requirements:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
                <li>Gmail data is only used to provide or improve MailMind's email management features</li>
                <li>Data is not transferred to others unless doing so is necessary for security purposes, legal compliance, or with your explicit consent</li>
                <li>Data is not used or transferred for serving ads, including retargeting or personalized advertising</li>
                <li>Data is not used or transferred to determine creditworthiness or for lending purposes</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-3">4.3 Data Processing Activities</h3>
              <p className="text-gray-700 leading-relaxed">
                We process your Gmail data exclusively for the following legitimate purposes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
                <li><strong>Email Display:</strong> Rendering your emails in our interface</li>
                <li><strong>AI Summarization:</strong> Generating intelligent summaries using Groq's LLM API</li>
                <li><strong>Search Functionality:</strong> Enabling fast search across your email content</li>
                <li><strong>Email Management:</strong> Organizing, archiving, and managing your emails</li>
                <li><strong>Sending Emails:</strong> Composing and sending emails through your Gmail account</li>
                <li><strong>Analytics:</strong> Providing usage statistics (aggregated, non-identifiable)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing and Third Parties</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-3">5.1 AI Processing</h3>
              <p className="text-gray-700 leading-relaxed">
                We use <strong>Groq's AI services</strong> to provide email summarization. When you request an email summary:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
                <li>Email content is sent securely to Groq's API for processing</li>
                <li>Groq processes the data temporarily to generate summaries</li>
                <li>No email content is stored permanently by Groq</li>
                <li>All communication is encrypted in transit</li>
                <li>Groq's use of data complies with our Limited Use requirements</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-3">5.2 Google Services</h3>
              <p className="text-gray-700 leading-relaxed">
                We integrate with Google services for authentication and Gmail access. Your data is subject to 
                Google's privacy policies when processed through their services. We do not share your Gmail data 
                with Google beyond what is necessary for the API functionality.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-3">5.3 No Sale or Unauthorized Transfer of Data</h3>
              <p className="text-gray-700 leading-relaxed">
                We do not sell, rent, trade, or transfer your personal information or Gmail data to third parties 
                for marketing, advertising, or commercial purposes. Any data sharing is strictly limited to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
                <li>Service providers necessary for MailMind functionality (e.g., Groq for AI processing)</li>
                <li>Legal compliance or law enforcement when required</li>
                <li>Security purposes to protect user safety</li>
                <li>With your explicit consent</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Storage and Security</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-3">6.1 Data Storage</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Gmail Content:</strong> Not stored permanently on our servers - accessed in real-time through Gmail API</li>
                <li><strong>Temporary Cache:</strong> Brief client-side caching for performance (2-minute TTL, then automatically deleted)</li>
                <li><strong>Session Data:</strong> Stored temporarily for authentication purposes only</li>
                <li><strong>Analytics Data:</strong> Aggregated, non-identifiable usage statistics only</li>
                <li><strong>No Persistent Storage:</strong> We do not maintain permanent copies of your email content</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-3">6.2 Security Measures</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Encryption:</strong> All data transmission is encrypted using HTTPS/TLS 1.3</li>
                <li><strong>OAuth 2.0:</strong> Secure authentication through Google's OAuth system with refresh tokens</li>
                <li><strong>Access Controls:</strong> Limited access to user data on a need-to-know basis</li>
                <li><strong>Regular Updates:</strong> Security patches and dependency updates applied promptly</li>
                <li><strong>No Storage:</strong> Email content is never stored on our servers, reducing security risks</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights and Choices</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>6.1 Access Control:</strong> You can revoke MailMind's access to your Gmail account at any time through your Google Account settings.</p>
              <p><strong>6.2 Data Deletion:</strong> When you revoke access, all cached data is automatically purged from our systems.</p>
              <p><strong>6.3 Communication Preferences:</strong> You can opt out of non-essential communications at any time.</p>
              <p><strong>6.4 Account Deletion:</strong> You can request complete account deletion by contacting us.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>7.1 Email Content:</strong> We do not retain your email content beyond the active session.</p>
              <p><strong>7.2 Cache Data:</strong> Temporary cache data is automatically deleted after 2 minutes.</p>
              <p><strong>7.3 Session Data:</strong> Authentication sessions expire and are cleared regularly.</p>
              <p><strong>7.4 Log Data:</strong> Server logs are retained for security and debugging purposes for up to 30 days.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              MailMind is not intended for use by children under the age of 13. We do not knowingly collect 
              personal information from children under 13. If we become aware that we have collected personal 
              information from a child under 13, we will take steps to delete such information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Our service may involve data processing in different countries. We ensure that all international 
              data transfers comply with applicable data protection laws and are secured through appropriate 
              safeguards.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage 
              you to review this Privacy Policy periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Compliance</h2>
            <div className="space-y-4 text-gray-700">
              <p>MailMind is committed to compliance with applicable privacy laws, including:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>GDPR:</strong> General Data Protection Regulation (EU)</li>
                <li><strong>CCPA:</strong> California Consumer Privacy Act (US)</li>
                <li><strong>Google API Policies:</strong> Google API Services User Data Policy</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <div className="text-gray-700">
              <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
              <ul className="mt-4 space-y-2">
                <li><strong>Email:</strong> daxmodi8521@gmail.com</li>
                <li><strong>Phone:</strong> +91 9157625875</li>
                <li><strong>Subject Line:</strong> "Privacy Policy Inquiry - MailMind"</li>
                <li><strong>GitHub:</strong> <a href="https://github.com/DaxModi/MailMind" className="text-blue-600 hover:underline">https://github.com/DaxModi/MailMind</a></li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                We will respond to your privacy-related inquiries within 30 days of receipt.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}