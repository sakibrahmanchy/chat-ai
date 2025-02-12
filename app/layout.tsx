import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import InstallPrompt from '@/components/install-prompt'
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${roboto.variable}`}>
        <body className="min-h-screen bg-background font-sans">
          <div className="relative flex min-h-screen flex-col">
            {children}
            <InstallPrompt />
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}