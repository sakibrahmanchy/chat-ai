'use client';

import { UserButton } from "@clerk/nextjs";
import { BrainCircuit } from "lucide-react";
import Link from "next/link";

export function AdminHeader() {
  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center px-8">
        <Link href="/admin" className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6" />
          <span className="text-lg font-semibold">Admin Panel</span>
        </Link>
        
        <div className="ml-auto flex items-center gap-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
} 