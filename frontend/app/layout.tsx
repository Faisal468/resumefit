import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

// Replace with your actual domain once you have it
const siteUrl = 'https://resumefit.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ResumeFit — AI Resume Optimizer & ATS Checker',
    template: '%s | ResumeFit',
  },
  description:
    'Beat ATS filters with AI. ResumeFit analyzes your resume against any job description, scores your match, finds missing keywords, and delivers tailored rewrites in seconds. Free analysis.',
  keywords: [
    'AI resume analyzer',
    'ATS resume checker',
    'resume optimizer',
    'resume scanner',
    'job description match',
    'free resume checker',
    'ATS resume scanner',
    'AI cover letter generator',
    'resume keyword analyzer',
    'tailor resume to job',
  ],
  authors: [{ name: 'Muhammad Faisal' }],
  creator: 'Muhammad Faisal',
  publisher: 'ResumeFit',
  applicationName: 'ResumeFit',
  category: 'Career Tools',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'ResumeFit',
    title: 'ResumeFit — AI Resume Optimizer & ATS Checker',
    description:
      'AI-powered resume analysis. Match your resume to any job description and beat ATS filters in seconds.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ResumeFit — AI Resume Analyzer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeFit — AI Resume Optimizer & ATS Checker',
    description:
      'Beat ATS filters. Match your resume to any job description in seconds with AI.',
    images: ['/og-image.png'],
    creator: '@your_twitter_handle',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  // Add once you verify in Search Console:
  // verification: {
  //   google: 'your-google-verification-code',
  // },
};

// JSON-LD structured data for the whole site
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'ResumeFit',
  url: siteUrl,
  description:
    'AI-powered resume analyzer that scores resumes against job descriptions and suggests improvements to beat ATS filters.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

// Replace with your actual GA4 measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            {children}
          </div>
        </AuthProvider>
        <Toaster position="top-right" richColors />

        {/* Google Analytics 4 — only loads in production with a valid ID */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}