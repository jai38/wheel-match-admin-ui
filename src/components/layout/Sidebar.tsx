import { LayoutDashboard, Car, Settings, LogOut, ChevronDown } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useProfile, useLogout } from "@/hooks/useAuth";
import { useState } from "react";
import logo from "@/assets/logo-wob.png";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Alloys", href: "/alloys", icon: Settings },
];

const masterDataNavigation = [
  {
    name: "Car Master Data",
    icon: Car,
    items: [
      { name: "Makes", href: "/car-makes" },
      { name: "Models", href: "/car-models" },
      { name: "Colors", href: "/car-colors" },
    ],
  },
  {
    name: "Alloy Master Data",
    icon: Settings,
    items: [
      { name: "Designs", href: "/alloy-designs" },
      { name: "PCDs", href: "/alloy-pcds" },
      { name: "Finishes", href: "/alloy-finishes" },
      { name: "Sizes", href: "/alloy-sizes" },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { data: user } = useProfile();
  const logout = useLogout();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const handleLogout = () => {
    logout.mutate();
  };

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  return (
    <div className={cn("flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground", className)}>
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <img 
          src={logo} 
          alt="Neo Wheels" 
          className="h-8 w-auto object-contain"
        />
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-primary shadow-glow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}

        {/* Master Data Sections */}
        <div className="space-y-2 py-2">
          {masterDataNavigation.map((group) => (
            <div key={group.name}>
              <button
                onClick={() => toggleGroup(group.name)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
              >
                <group.icon className="h-5 w-5" />
                <span className="flex-1 text-left">{group.name}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    expandedGroups.includes(group.name) && "rotate-180"
                  )}
                />
              </button>
              {expandedGroups.includes(group.name) && (
                <div className="space-y-1 pl-4">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
                        )
                      }
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User Section */}
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {user?.name?.substring(0, 2).toUpperCase() || "AD"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
            <p className="text-xs text-sidebar-foreground/70">{user?.email || "Loading..."}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
