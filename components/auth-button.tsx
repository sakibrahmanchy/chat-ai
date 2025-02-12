'use client';

import { SignInButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { type ButtonProps } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from '@/lib/analytics';

interface AuthButtonProps extends ButtonProps {
  signInText?: string;
  signedInHref?: string;
  loadingText?: string;
  redirectText?: string;
  className?: string;
  redirectDelay?: number;
  showLoadingText?: boolean;
  shouldTrackRedirect?: boolean;
  trackingEvent?: string;
}

export function AuthButton({ 
  children, 
  signInText = "Get Started", 
  signedInHref = "/dashboard",
  loadingText = "Loading...",
  redirectText = "Redirecting...",
  className,
  redirectDelay = 0,
  showLoadingText = false,
  shouldTrackRedirect = false,
  trackingEvent = 'dashboard_redirect',
  ...props 
}: AuthButtonProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Handle redirect with optional delay and callback
  const handleRedirect = async () => {
    setIsRedirecting(true);
    try {
      if (shouldTrackRedirect) {
        await track(trackingEvent);
      }
      if (redirectDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, redirectDelay));
      }
      router.push(signedInHref);
    } catch (error) {
      console.error('Redirect error:', error);
      setIsRedirecting(false);
    }
  };

  // Loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <Button 
        {...props}
        className={cn("animate-pulse", className)} 
        disabled
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {showLoadingText && loadingText}
      </Button>
    );
  }

  // Already signed in - show redirect button
  if (isSignedIn) {
    return (
      <Button 
        onClick={handleRedirect} 
        {...props}
        className={cn(
          "transition-all duration-300",
          isRedirecting && "animate-pulse",
          className
        )}
        disabled={isRedirecting}
      >
        {isRedirecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {redirectText}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }

  // Not signed in - show sign in button with hover animation
  return (
    <SignInButton mode="modal" 
      signUpForceRedirectUrl={'/dashboard'}
      fallbackRedirectUrl={'/dashboard'}
    >
      <Button 
        {...props}
        className={cn(
          "transition-all duration-300 hover:scale-102",
          className
        )}
      >
        {children || signInText}
      </Button>
    </SignInButton>
  );
} 