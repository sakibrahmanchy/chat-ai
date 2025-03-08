'use client';

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/smarthrflow/logo";
import { AuthButton } from "@/components/auth-button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  currentPath?: string;
}

export function Navbar({ currentPath = '/' }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-screen z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center space-x-3">
          <Logo size={40} animated />
        </Link>

        <div className="hidden lg:flex items-center gap-4">
          <nav className="flex items-center gap-6">
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

        {/* Mobile nav */}
        <div className="flex lg:hidden items-center gap-2">
          <AuthButton
            variant="ghost"
            size="sm"
            signInText="Sign In"
            className="hover:bg-indigo-50"
          >
            Sign In
          </AuthButton>
          
          <button
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "absolute top-full left-0 right-0 bg-white border-b p-4 lg:hidden transition-all duration-200 ease-in-out",
            isMenuOpen ? "translate-y-0 opacity-100 visible" : "-translate-y-2 opacity-0 invisible"
          )}
        >
          <div className="flex flex-col space-y-4">
            <Link
              href="/features"
              className={`text-sm font-medium transition-colors p-2 rounded-md ${
                currentPath === '/features' ? 'text-indigo-600 bg-indigo-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className={`text-sm font-medium transition-colors p-2 rounded-md ${
                currentPath === '/pricing' ? 'text-indigo-600 bg-indigo-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors p-2 rounded-md ${
                currentPath === '/about' ? 'text-indigo-600 bg-indigo-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <div className="flex flex-col gap-2 pt-2 border-t">
              <AuthButton
                className="w-full justify-center bg-gradient-to-r from-indigo-600 to-indigo-500"
                size="sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </AuthButton>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 