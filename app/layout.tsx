import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
// import InstallPrompt from '@/components/install-prompt'
import { Roboto } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"
import { SupportButton } from '@/components/support-button';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
});

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://smarthrflow.com'),
  title: {
    default: 'SmartHRFlow - AI-Powered Recruitment Platform',
    template: '%s | SmartHRFlow'
  },
  description: 'Transform your hiring process with AI-powered candidate screening, automated resume parsing, and intelligent matching technology. Save time and hire smarter.',
  keywords: [
    'AI recruitment',
    'hiring platform',
    'resume parsing',
    'candidate screening',
    'recruitment software',
    'HR technology',
    'talent acquisition',
    'applicant tracking system',
    'ATS',
    'AI hiring',
    'recruitment automation'
  ],
  authors: [{ name: 'SmartHRFlow Team' }],
  creator: 'SmartHRFlow',
  publisher: 'SmartHRFlow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://smarthrflow.com',
    title: 'SmartHRFlow - AI-Powered Recruitment Platform',
    description: 'Transform your hiring process with AI-powered candidate screening, automated resume parsing, and intelligent matching technology.',
    siteName: 'SmartHRFlow',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'SmartHRFlow Platform Preview',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SmartHRFlow - AI-Powered Recruitment Platform',
    description: 'Transform your hiring process with AI-powered candidate screening and intelligent matching technology.',
    images: ['/twitter-image.png'],
    creator: '@smarthrflow',
    site: '@smarthrflow',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
      },
    ],
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code'
  },
  alternates: {
    canonical: 'https://smarthrflow.com',
    languages: {
      'en-US': 'https://smarthrflow.com',
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${roboto.variable}`}>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
          <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
          {/* Add preload for critical assets */}
          <link
            rel="preload"
            href="/og-image.png"
            as="image"
            type="image/png"
          />
        </head>
        <body className={cn(
          inter.className,
          'min-h-screen bg-background antialiased'
        )}>
          <div className="relative flex min-h-screen flex-col">
            {children}
            {/* <InstallPrompt /> */}
            <Toaster />
            <SupportButton />
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}