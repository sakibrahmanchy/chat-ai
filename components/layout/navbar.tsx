import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/smarthrflow/logo";
import { AuthButton } from "@/components/auth-button";

interface NavbarProps {
  currentPath?: string;
}

export function Navbar({ currentPath = '/' }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center space-x-3">
          <Logo size={40} animated />
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex items-center gap-6">
            <Link 
              href="/features" 
              className={`text-sm font-medium transition-colors ${
                currentPath === '/features' ? 'text-indigo-600' : 'hover:text-indigo-600'
              }`}
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className={`text-sm font-medium transition-colors ${
                currentPath === '/pricing' ? 'text-indigo-600' : 'hover:text-indigo-600'
              }`}
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className={`text-sm font-medium transition-colors ${
                currentPath === '/about' ? 'text-indigo-600' : 'hover:text-indigo-600'
              }`}
            >
              About
            </Link>
          </nav>
          <AuthButton
            variant="ghost"
            size="sm"
            signInText="Sign In"
            loadingText="Loading..."
            redirectText="Taking you to dashboard..."
            redirectDelay={500}
            showLoadingText
            shouldTrackRedirect
            trackingEvent="signin_redirect"
            className="hover:bg-indigo-50"
          >
            Sign In
          </AuthButton>
          <AuthButton
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/50 transition-all duration-200"
            size="sm"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </AuthButton>
        </div>
      </div>
    </nav>
  );
} 