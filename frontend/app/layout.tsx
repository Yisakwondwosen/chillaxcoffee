import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chillax Coffee, Bisrate Gabriel, Addis Ababa',
  description: 'Cozy coffee shop in Bisrate Gabriel, Addis Ababa. Fresh Ethiopian highland coffee, traditional clay Jebena coffee, comfortable botanical sofas, and fresh pastries.',
  keywords: ['Chillax Coffee', 'Bisrate Gabriel', 'Addis Ababa', 'Ethiopian Coffee', 'Macchiato', 'Jebena'],
  openGraph: {
    title: 'Chillax Coffee, Bisrate Gabriel, Addis Ababa',
    description: 'Enjoy fresh Ethiopian coffee, comfortable sofa seating, and a peaceful atmosphere in Bisrate Gabriel.',
    type: 'website',
  },
  icons: {
    icon: '/Assets/logo.png',
    shortcut: '/Assets/logo.png',
    apple: '/Assets/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;1,400&family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Noto+Serif+Ethiopic:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-pure-white text-graphite antialiased selection:bg-cobalt-signal selection:text-pure-white">
        {children}
      </body>
    </html>
  );
}
