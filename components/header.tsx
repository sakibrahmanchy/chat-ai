'use client';

import { SignedIn, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "./ui/button"
import { 
  Briefcase, 
  FileText, 
  LayoutDashboard, 
  Settings, 
  Users,
  Menu,
  X,
  BrainCircuit
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from "react"

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
  {
    name: 'Candidates',
    href: '/dashboard/candidates',
    icon: Users
  }
];

const actionItems = [
  {
    name: 'Post Job',
    href: '/dashboard/jobs/new',
    icon: Briefcase,
    variant: 'outline' as const
  },
  {
    name: 'Upload Resume',
    href: '/dashboard/upload',
    icon: FileText,
    variant: 'default' as const
  }
];

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 w-full bg-white shadow-sm border-b">
      <div className="flex h-16 items-center px-4 justify-between">
        {/* Enhanced Logo */}
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-1.5 rounded-lg shadow-md">
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl tracking-tight">
              <span className="font-light">Smart</span>
              <span className="font-bold text-indigo-600">HR</span>
              <span className="font-medium">Flow</span>
            </span>
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
              <SheetContent>
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

                  <div className="border-t pt-4">
                    <Link 
                      href="/dashboard/settings"
                      onClick={() => setOpen(false)}
                    >
                      <Button variant="ghost" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-2">
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
            <div className="flex items-center space-x-2 border-l pl-2 ml-2">
              <Button asChild variant="ghost" size="icon">
                <Link href="/dashboard/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  )
}

export default Header