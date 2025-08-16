import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard,
  Users,
  Route,
  Building,
  Handshake,
  CreditCard,
  Bus,
  MessageCircle,
  BarChart3
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Lead Management", href: "/leads", icon: Users },
  { name: "Customer Journey", href: "/customer-journey", icon: Route },
  { name: "Inventory", href: "/inventory", icon: Building },
  { name: "Negotiations", href: "/negotiations", icon: Handshake },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Channel Partners", href: "/channel-partners", icon: Bus },
  { name: "Communication", href: "/communication", icon: MessageCircle },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="p-6">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                    isActive 
                      ? "text-primary-600 bg-primary-50" 
                      : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                  )}>
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
