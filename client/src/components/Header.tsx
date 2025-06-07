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
import { CartWidget } from '@/components/CartWidget';

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
      { title: "System Health", path: "/system-health" },
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
      <div className="container mx-auto px-3 lg:px-4 h-14 lg:h-16 flex items-center justify-between">
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
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-40">
          <nav className="container mx-auto px-4 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {menuStructure.map((menuItem, idx) => (
              <div key={idx} className="mb-4">
                <Link href={menuItem.path}>
                  <div className="font-semibold text-lg mb-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer py-2 border-b border-gray-100 dark:border-gray-700">
                    {menuItem.title}
                  </div>
                </Link>
                <div className="pl-4 space-y-1">
                  {menuItem.subItems.map((subItem, subIdx) => (
                    <Link key={subIdx} href={subItem.path}>
                      <div
                        className={cn(
                          "py-2 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer rounded-md px-2 hover:bg-gray-50 dark:hover:bg-gray-800",
                          location === subItem.path 
                            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                            : "text-gray-700 dark:text-gray-300"
                        )}
                      >
                        {subItem.title}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Additional menu items */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              <Link href="/customers" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Customers
              </Link>

              <Link href="/frame-education">
                <div 
                  className={cn(
                    "py-2 px-2 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer rounded-md hover:bg-gray-50 dark:hover:bg-gray-800",
                    location === "/frame-education" 
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  Frame Education
                </div>
              </Link>

              <div className="py-3 px-2 flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-md">
                <span className="font-medium text-gray-700 dark:text-gray-300">Cart Items:</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
                  {cartItems}
                </span>
              </div>

              {authenticated && user && (
                <div className="py-3 px-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Welcome, {user.name || user.username || 'User'}
                  </span>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}


    </header>
  );
}