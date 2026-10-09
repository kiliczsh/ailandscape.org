import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "sonner";
import { IntroBanner } from "@/components/landscape/intro-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSiteStats } from "@/lib/site-stats";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Computed per request so dev YAML edits show up in the SEO counts
export function generateMetadata(): Metadata {
  const stats = getSiteStats();
  const SEO_TITLE = `AI Tools Landscape — ${stats.label} Models, Agents & AI Tools`;
  const SEO_DESCRIPTION = `Explore ${stats.label} AI tools, models, agents, and infrastructure across ${stats.categories} categories. Compare options, filter by tags, and discover the AI ecosystem.`;
  return {
    metadataBase: new URL("https://ailandscape.org"),
    verification: {
      google: "kkgUYOfGT0s-Qf25fo18UEK-a_zkjPUy3ISJc8aTuSw",
      other: {
        "google-adsense-account": "ca-pub-8397851036658136",
      },
    },
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    alternates: {
      canonical: "https://ailandscape.org",
      types: {
        "application/rss+xml": [
          { url: "/feed.xml", title: "AI Landscape — Recently Added" },
        ],
      },
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: SEO_TITLE,
      description: SEO_DESCRIPTION,
      type: "website",
      url: "https://ailandscape.org",
    },
    twitter: {
      card: "summary_large_image",
      title: SEO_TITLE,
      description: SEO_DESCRIPTION,
      site: "@ailandscape",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const stats = getSiteStats();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geistSans.variable, geistMono.variable)}
    >
      <head>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, no user input
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "AI Landscape",
              url: "https://ailandscape.org",
              description: `Explore ${stats.label} AI tools, models, agents, and infrastructure across ${stats.categories} categories.`,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://ailandscape.org/?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      {/* No ad units render yet — lazyOnload keeps AdSense off the critical path */}
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8397851036658136"
        strategy="lazyOnload"
        crossOrigin="anonymous"
      />
      {/* GA only in production builds; hostname check keeps wrangler preview
          (localhost:8787 serves the production build) out of the property */}
      {process.env.NODE_ENV === "production" && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-8CGGHC6P4F"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              if (location.hostname === 'ailandscape.org') {
                window.dataLayer = window.dataLayer || [];
                window.gtag = function(){dataLayer.push(arguments);};
                gtag('js', new Date());
                gtag('config', 'G-8CGGHC6P4F');
              }
            `}
          </Script>
        </>
      )}
      <body className="flex min-h-screen flex-col antialiased">
        {/* noscript colors are static hex — CSS variables don't work without JS */}
        <noscript>
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              fontFamily: "system-ui, sans-serif",
              fontSize: "0.875rem",
              background: "#fafafa",
              borderBottom: "1px solid #e5e7eb",
              color: "#374151",
            }}
          >
            <strong>JavaScript is required</strong> to view the AI Landscape.
            Please enable JavaScript in your browser to explore the ecosystem.
          </div>
        </noscript>
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded focus-visible:bg-background focus-visible:px-3 focus-visible:py-1.5 focus-visible:text-xs focus-visible:font-medium focus-visible:text-foreground focus-visible:ring-1 focus-visible:ring-border"
        >
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <IntroBanner />
            <SiteHeader />
            <main id="main-content" className="flex flex-col flex-1">
              {children}
            </main>
            <SiteFooter />
            <Toaster position="bottom-center" richColors />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
