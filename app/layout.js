import './globals.css';

const SITE_URL = 'https://www.gaurimarkandey.com';
const DESCRIPTION =
  'Frontend Software Engineer with 2+ years in production, building interfaces in React, Angular, and TypeScript with full-stack and cloud breadth in Spring Boot, AWS, and Docker.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Gauri Markandey — Frontend Software Engineer',
    template: '%s · Gauri Markandey',
  },
  description: DESCRIPTION,
  keywords: ['Gauri Markandey', 'Frontend Software Engineer', 'React', 'Angular', 'TypeScript', 'Spring Boot', 'Portfolio'],
  authors: [{ name: 'Gauri Markandey', url: SITE_URL }],
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'Gauri Markandey — Frontend Software Engineer',
    description: DESCRIPTION,
    siteName: 'Gauri Markandey',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Gauri Markandey — Frontend Software Engineer' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gauri Markandey — Frontend Software Engineer',
    description: DESCRIPTION,
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
