import "./globals.css";
import localFont from 'next/font/local';
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import { AlertProvider } from "@/components/providers/AlertProvider";

export const metadata = {
  title: {
    default: 'MailMind - Smart Email Management',
    template: '%s | MailMind'
  },
  description: 'MailMind - AI-powered email management with smart summaries, intelligent search, and seamless Gmail integration.',
};

const Linotype = localFont({
  src: './fonts/Linotype-Didot-Italic.otf',
  display: 'swap',
  variable: '--font-linotype' // Add this
});

const RFDewi = localFont({
  src: [
    {
      path: './fonts/RFDewi-Regular.woff',
      weight: '400', // Add weights
    },
    {
      path: './fonts/RFDewi-Bold.woff',
      weight: '700',
    },
    {
      path: './fonts/RFDewi-Semibold.woff',
      weight: '600',
    },
  ],
  variable: '--font-rf',
  display: 'swap'
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${Linotype.variable} ${RFDewi.className}`}>
      <body className="*:m-0 *:p-0">
        <SessionProviderWrapper>
          <AlertProvider>
            {children}
          </AlertProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}