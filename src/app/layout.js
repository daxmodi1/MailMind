import "./globals.css";
import localFont from 'next/font/local';

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
      path: './fonts/RFDewi-SemiBold.woff',
      weight: '600',
    },
  ],
  variable: '--font-rf',
  display: 'swap'
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${Linotype.variable} ${RFDewi.className}`}>
      <body>
        {children}
      </body>
    </html>
  );
}