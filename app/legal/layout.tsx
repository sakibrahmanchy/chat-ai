import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <div className="flex min-h-screen">
      <div className="hidden lg:block w-64 p-8 border-r">
        <nav className="space-y-2">
          {legalNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 text-sm rounded-lg hover:bg-slate-100"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <main className="flex-1">{children}</main>
    </div>
  );
} 