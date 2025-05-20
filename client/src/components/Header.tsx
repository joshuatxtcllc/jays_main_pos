
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Moon, Sun, Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

// Define menu structure
const menuStructure = [
  {
    title: "Dashboard",
    path: "/dashboard",
    subItems: [
      { title: "Overview", path: "/dashboard" },
      { title: "Inventory", path: "/inventory" },
      { title: "Inventory Tracking", path: "/inventory-tracking" },
    ]
  },
  {
    title: "Orders",
    path: "/orders",
    subItems: [
      { title: "Orders List", path: "/orders" },
      { title: "Order Progress", path: "/order-progress/1" },
      { title: "Payment Links", path: "/payment-links" },
    ]
  },
  {
    title: "Production",
    path: "/production",
    subItems: [
      { title: "Kanban Board", path: "/production" },
      { title: "Materials Orders", path: "/materials" },
      { title: "Materials Pick List", path: "/materials-pick-list" },
    ]
  },
  {
    title: "POS",
    path: "/",
    subItems: [
      { title: "New Order", path: "/" },
      { title: "Mat Options", path: "/mat-test" },
      { title: "Mat Border Demo", path: "/mat-border-demo" },
      { title: "Pricing", path: "/pricing" },
    ]
  },
  {
    title: "Integration",
    path: "/hub",
    subItems: [
      { title: "Hub", path: "/hub" },
      { title: "Webhook", path: "/webhook-integration" },
      { title: "Vendor Settings", path: "/vendor-settings" },
    ]
  }
];

export default function Header({ darkMode, toggleTheme }: HeaderProps) {
  const [location] = useLocation();
  const { isMobile } = useMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<number>(0);
  const { authenticated, user } = useAuth();

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when changing location
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Get cart items from local storage
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(Array.isArray(parsedCart) ? parsedCart.length : 0);
      } catch (e) {
        console.error('Error parsing cart from localStorage:', e);
        setCartItems(0);
      }
    }

    // Listen for storage events to update cart count when it changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        try {
          const newCart = e.newValue ? JSON.parse(e.newValue) : [];
          setCartItems(Array.isArray(newCart) ? newCart.length : 0);
        } catch (e) {
          console.error('Error parsing cart from storage event:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <header className="bg-background border-b dark:border-gray-800 fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard">
          <a className="flex items-center space-x-2 cursor-pointer">
            <span className="font-bold text-xl text-black dark:text-white">Jay's Frames</span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              {menuStructure.map((menuItem, idx) => (
                <NavigationMenuItem key={idx}>
                  <NavigationMenuTrigger className="text-black dark:text-white font-semibold">
                    {menuItem.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-2 p-2">
                      {menuItem.subItems.map((subItem, subIdx) => (
                        <li key={subIdx}>
                          <Link href={subItem.path}>
                            <a className={cn(
                              "block select-none rounded-md p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                              location === subItem.path && "bg-accent/50 text-accent-foreground"
                            )}>
                              {subItem.title}
                            </a>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right section: Theme toggle, cart, mobile menu button */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Cart icon and counter */}
          <Button variant="ghost" size="icon" onClick={() => window.location.href = "/checkout/cart"}>
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[0.7rem]">
                  {cartItems}
                </Badge>
              )}
            </div>
          </Button>

          {/* User info (if authenticated) */}
          {authenticated && user && (
            <span className="text-sm hidden md:inline-block text-foreground dark:text-white">
              {user.name || user.username || 'User'}
            </span>
          )}

          {/* Mobile menu button */}
          <Button 
            className="md:hidden" 
            variant="ghost" 
            size="icon" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        "md:hidden transition-all duration-300 overflow-hidden",
        isMobileMenuOpen ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0"
      )}>
        <nav className="container px-4 py-4 flex flex-col space-y-3 bg-white dark:bg-gray-900 overflow-y-auto max-h-[70vh]">
          {menuStructure.map((menuItem, idx) => (
            <div key={idx} className="py-1">
              <div 
                className="font-medium text-lg mb-1 text-foreground dark:text-white cursor-pointer" 
                onClick={() => window.location.href = menuItem.path}
              >
                {menuItem.title}
              </div>
              <div className="pl-4 flex flex-col space-y-2">
                {menuItem.subItems.map((subItem, subIdx) => (
                  <div
                    key={subIdx}
                    className={cn(
                      "py-1 font-medium text-foreground dark:text-white hover:text-primary transition-colors cursor-pointer",
                      location === subItem.path && "text-primary"
                    )}
                    onClick={() => window.location.href = subItem.path}
                  >
                    {subItem.title}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div 
            className={cn(
              "py-1 font-medium text-foreground dark:text-white hover:text-primary transition-colors cursor-pointer",
              location === "/customers" && "text-primary"
            )}
            onClick={() => window.location.href = "/customers"}
          >
            Customers
          </div>
          
          <div 
            className={cn(
              "py-1 font-medium text-foreground dark:text-white hover:text-primary transition-colors cursor-pointer",
              location === "/frame-education" && "text-primary"
            )}
            onClick={() => window.location.href = "/frame-education"}
          >
            Frame Education
          </div>

          <div className="py-2 flex items-center">
            <span className="font-medium mr-4">Cart:</span>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
              {cartItems} items
            </span>
          </div>
        </nav>
      </div>
    </header>
  );
}
