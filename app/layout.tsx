import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import './globals.css'
import InstallPrompt from '@/components/install-prompt'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen h-screen overflow-hidden flex flex-col">
          {children}
          <InstallPrompt />
        </body>
      </html>
    </ClerkProvider>
  )
}