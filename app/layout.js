import './globals.css';

export const metadata = {
  title: 'Gauri Markandey',
  description: 'Frontend-focused Software Engineer with full-stack and cloud experience.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%234C8DFF'/%3E%3Cstop offset='1' stop-color='%2322D3EE'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='8' fill='url(%23g)'/%3E%3Ctext x='16' y='22' font-family='Arial Black,sans-serif' font-size='14' font-weight='900' fill='white' text-anchor='middle'%3EGM%3C/text%3E%3C/svg%3E" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Syne:wght@700;800&family=Bangers&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme', t==='dark'?'dark':'light');}catch(e){}`,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
