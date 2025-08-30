import { cn } from "@/lib/utils";
import { 
  LayoutDashboard,
  Package,
  Plus,
  Users,
  Bus,
  Calculator,
  SearchCheck,
  BarChart3,
  Shield
} from "lucide-react";
import { Link, useLocation } from "wouter";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    href: "/orders", 
    icon: Package,
  },
  {
    name: "Create Order",
    href: "/create-order",
    icon: Plus,
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    name: "Delivery Agents",
    href: "/agents",
    icon: Bus,
  },
  {
    name: "Admin",
    href: "/admin",
    icon: Shield,
  },
];

const services = [
  {
    name: "Rate Calculator",
    href: "/rate-calculator",
    icon: Calculator,
  },
  {
    name: "Tracking",
    href: "/tracking",
    icon: SearchCheck,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border">
      <nav className="p-4 space-y-2">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Main Menu
          </h2>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <span
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                      data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Services
          </h2>
          <ul className="space-y-1">
            {services.map((item) => {
              const isActive = location === item.href;
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <span
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                      data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}