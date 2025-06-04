import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, Heart, Map, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    {
      icon: Search,
      label: "Search",
      path: "/",
      active: location === "/",
    },
    {
      icon: Heart,
      label: "Saved",
      path: "/saved",
      active: location === "/saved",
    },
    {
      icon: Map,
      label: "Map",
      path: "#",
      active: false,
      onClick: () => {
        // Map view functionality would go here
        console.log("Map view clicked");
      }
    },
    {
      icon: User,
      label: "Profile",
      path: "#",
      active: false,
      onClick: () => {
        // Profile functionality would go here
        console.log("Profile clicked");
      }
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-2 z-40">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            size="sm"
            onClick={item.onClick || (() => setLocation(item.path))}
            className={`flex flex-col items-center py-2 px-3 ${
              item.active 
                ? "text-primary" 
                : "text-neutral-500 hover:text-primary"
            }`}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
