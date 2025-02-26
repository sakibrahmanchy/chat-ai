import Link from "next/link";
import { 
  Users, Settings, CreditCard, BarChart, 
  Building, FileText, AlertCircle, Database 
} from "lucide-react";

const adminNavItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: BarChart,
  },
  {
    title: "Companies",
    href: "/admin/companies",
    icon: Building,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Credit Plans",
    href: "/admin/credits",
    icon: CreditCard,
  },
  {
    title: "Jobs",
    href: "/admin/jobs",
    icon: FileText,
  },
  // {
  //   title: "System Logs",
  //   href: "/admin/logs",
  //   icon: AlertCircle,
  // },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  }
];

export function AdminSidebar() {
  return (
    <div className="w-64 min-h-screen bg-white border-r">
      <div className="p-6">
        <nav className="space-y-1">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-slate-100"
            >
              <item.icon className="h-5 w-5 mr-3 text-slate-500" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
} 