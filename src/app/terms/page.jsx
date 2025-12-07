export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for MailMind - AI-powered email management platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: December 7, 2025</p>
        </div>

        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using MailMind ("the Service"), you accept and agree to be bound by the terms and 
              provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              MailMind is an AI-powered email management platform that provides:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Email summarization using artificial intelligence</li>
              <li>Smart search capabilities across your Gmail account</li>
              <li>Email analytics and insights</li>
              <li>Compose assistance and templates</li>
              <li>Integration with Gmail through Google OAuth</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Authentication</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>3.1 Gmail Integration:</strong> MailMind requires access to your Gmail account through 
                Google OAuth to provide our services.
              </p>
              <p>
                <strong>3.2 Account Security:</strong> You are responsible for maintaining the security of your 
                Google account and any activities that occur under your account.
              </p>
              <p>
                <strong>3.3 Account Termination:</strong> You may revoke MailMind's access to your Gmail account 
                at any time through your Google Account settings.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
            <div className="space-y-4 text-gray-700">
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Send spam or unauthorized communications</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Attempt to gain unauthorized access to other user accounts</li>
                <li>Use the Service for any illegal or harmful activities</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Privacy and Data Protection</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>5.1 Data Processing:</strong> We process your email data solely to provide our services. 
                Email content is analyzed temporarily for summarization and never stored permanently.
              </p>
              <p>
                <strong>5.2 Third-Party AI:</strong> We use Groq's AI services for email summarization. Email 
                content is sent to Groq's secure API and processed in compliance with their privacy policies.
              </p>
              <p>
                <strong>5.3 Data Retention:</strong> We do not store your email content. Session data and 
                cache are temporary and automatically cleared.
              </p>
              <p>
                For detailed information, please review our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Service Availability</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>6.1 Uptime:</strong> We strive to maintain high service availability but do not guarantee 
                100% uptime.
              </p>
              <p>
                <strong>6.2 Maintenance:</strong> We may temporarily suspend the Service for maintenance, updates, 
                or improvements with reasonable notice.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>7.1 Service Content:</strong> MailMind and its original content, features, and functionality 
                are owned by Dax Modi and are protected by copyright and other intellectual property laws.
              </p>
              <p>
                <strong>7.2 User Content:</strong> You retain all rights to your email content. You grant us a 
                limited license to process your data solely to provide our services.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-gray-700 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
              INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
              OR NON-INFRINGEMENT.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              IN NO EVENT SHALL MAILMIND OR ITS DEVELOPERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, 
              GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material 
              changes by posting the new Terms of Service on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
            <div className="text-gray-700">
              <p>If you have any questions about these Terms of Service, please contact us:</p>
              <ul className="mt-2 space-y-1">
                <li><strong>Email:</strong> daxmodi8521@gmail.com</li>
                <li><strong>Phone:</strong> +91 9157625875</li>
                <li><strong>GitHub:</strong> <a href="https://github.com/DaxModi/MailMind" className="text-blue-600 hover:underline">https://github.com/DaxModi/MailMind</a></li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be interpreted and governed by the laws of India, without regard to its 
              conflict of law provisions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}