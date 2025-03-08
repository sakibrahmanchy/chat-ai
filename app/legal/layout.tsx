import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import Link from "next/link";

const legalNavItems = [
  {
    title: "Terms of Service",
    href: "/legal/terms",
  },
  {
    title: "Privacy Policy",
    href: "/legal/privacy",
  },
  {
    title: "Cookie Policy",
    href: "/legal/cookies",
  },
];

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex p-10 items-center justify-center">{children}</main>
      <Footer />
    </div>
  );
} 