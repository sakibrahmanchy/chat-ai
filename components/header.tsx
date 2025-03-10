'use client';

import { SignedIn, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "./ui/button"
import {
  Briefcase,
  LayoutDashboard,
  Menu,
  PlusIcon,
  CreditCard
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useEffect, useState } from "react"
import { Logo } from "./smarthrflow/logo";
import { CreditsData, creditService } from "@/lib/services/credits.service";
import { useCompany } from "@/hooks/use-company";

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Jobs',
    href: '/dashboard/jobs',
    icon: Briefcase
  },
  // {
  //   name: 'Candidates',
  //   href: '/dashboard/candidates',
  //   icon: Users
  // }
];

const actionItems = [
  {
    name: 'Post Job',
    href: '/dashboard/jobs/new',
    icon: PlusIcon,
    variant: 'default' as const
  },
  // {
  //   name: 'Upload Resume',
  //   href: '/dashboard/upload',
  //   icon: FileText,
  //   variant: 'default' as const
  // }
];

const CreditView = () => {
  const { companyId } = useCompany();
  const [creditsData, setCreditsData] = useState<CreditsData | null>({
    credits_balance: 0,
    credits_used: 0,
    credits_remaining: 0,
    credits_used_percentage: 0
  });
  useEffect(() => {
    const fetchCredits = async () => {
      if (!companyId) return;
      const credits = await creditService.getCreditsData(companyId);
      setCreditsData(credits);
    };
    fetchCredits();
  }, [companyId]);

  if (!companyId || !creditsData) {
    return null;
  }

  const creditsColor = () => {
    if (creditsData.credits_used_percentage <= 50) return "success";
    if (creditsData.credits_used_percentage > 50 && creditsData.credits_used_percentage <= 70) return "warning";
    return "destructive";
  }

  return (
    <div>
      <Link
        href="/dashboard/settings"
      >
        <Button variant={creditsColor()} className="w-full justify-start">
          <CreditCard className="h-4 w-4 mr-2" />
          {creditsData.credits_remaining} Credits
        </Button>
      </Link>
    </div>
  )
}


function Header() {
  const [open, setOpen] = useState(false);
  return (
    <div className="sticky top-0 z-50 w-full bg-white shadow-sm border-b">
      <div className="flex h-16 items-center px-4 justify-between">
        {/* Enhanced Logo */}
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <Logo size={40} animated />
          </Link>
        </div>

        <SignedIn>
          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-white">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-4">


                  {/* Navigation Items */}
                  <div className="flex flex-col gap-2">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setOpen(false)}
                      >
                        <Button variant="ghost" className="w-full justify-start">
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </Button>
                      </Link>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    {actionItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block mb-2"
                      >
                        <Button variant={item.variant} className="w-full justify-start">
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </Button>
                      </Link>
                    ))}
                  </div>

                  {/* Credits */}
                  <CreditView />

                  {/* <div className="border-t pt-4">
                    <Link 
                      href="/dashboard/settings"
                      onClick={() => setOpen(false)}
                    >
                      <Button variant="ghost" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </Link>
                  </div> */}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-2">

            <CreditView />
            {/* Main Navigation */}
            <nav className="flex items-center space-x-2">
              {navigationItems.map((item) => (
                <Button key={item.name} asChild variant="ghost" size="sm">
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                </Button>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 border-l pl-2 ml-2">
              {actionItems.map((item) => (
                <Button key={item.name} asChild variant={item.variant} size="sm">
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                </Button>
              ))}
            </div>

            {/* Settings & Profile */}
            <div className="flex items-center justify-between space-x-2 border-l pl-4 ml-4 gap-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  )
}

export default Header