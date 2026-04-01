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
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ailandscape.org"),
  verification: {
    google: "kkgUYOfGT0s-Qf25fo18UEK-a_zkjPUy3ISJc8aTuSw",
  },
  title: "AI Landscape — The Complete Map of the AI Ecosystem",
  description:
    "Explore AI tools, frameworks, and services in one place. Browse models, infrastructure, developer tools, and products — organized by category and filterable by tag.",
  alternates: {
    canonical: "https://ailandscape.org",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "AI Landscape — The Complete Map of the AI Ecosystem",
    description:
      "Explore every AI tool, framework, and service in one place. Browse by category, filter by tag, and navigate the full AI ecosystem with ease.",
    type: "website",
    url: "https://ailandscape.org",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Landscape — The Complete Map of the AI Ecosystem",
    description:
      "Explore every AI tool, framework, and service in one place. Browse by category, filter by tag, and navigate the full AI ecosystem with ease.",
    site: "@ailandscape",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geistSans.variable, geistMono.variable)}
    >
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, no user input
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "AI Landscape",
            url: "https://ailandscape.org",
            description:
              "Explore AI tools, frameworks, and services organized by category.",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://ailandscape.org/?q={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-8CGGHC6P4F"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-8CGGHC6P4F');
        `}
      </Script>
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
