import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SiteBlitz | Premium AI Website Auditor",
  description: "AI-Powered Website Audit in Seconds. Instantly analyze your UI/UX, SEO, performance, and accessibility.",
  keywords: ["website auditor", "seo analysis", "performance monitoring", "ai audit", "siteblitz", "web development"],
  openGraph: {
    title: "SiteBlitz | AI Website Auditor",
    description: "Get an AI-powered comprehensive audit of your website's performance, SEO, and UI/UX.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SiteBlitz | AI Website Auditor",
    description: "Get an AI-powered comprehensive audit of your website's performance, SEO, and UI/UX.",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  const msg = String(args[0] || '');
                  if (msg.includes('Hydration failed') && msg.includes('injected')) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
