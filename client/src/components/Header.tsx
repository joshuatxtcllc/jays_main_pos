import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import ReplitAuthButton from './ReplitAuth';
import { cn } from '@/lib/utils';
import { CartWidget } from './CartWidget';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

interface HeaderProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Menu item definitions with their submenus
  const menuStructure = [
    {
      title: "POS System",
      path: "/",
      subItems: [
        { title: "Point of Sale", path: "/" },
        { title: "Pricing", path: "/pricing" },
        { title: "Payment Links", path: "/payment-links" },
      ]
    },
    {
      title: "Orders",
      path: "/orders",
      subItems: [
        { title: "All Orders", path: "/orders" },
        { title: "Dashboard", path: "/dashboard" },
        { title: "Order Progress", path: "/order-progress" },
      ]
    },
    {
      title: "Customers",
      path: "/customers",
      subItems: [
        { title: "Customer List", path: "/customers" },
      ]
    },
    {
      title: "Production",
      path: "/production",
      subItems: [
        { title: "Production Board", path: "/production" },
        { title: "Pick List", path: "/materials-pick-list" },
      ]
    },
    {
      title: "Materials",
      path: "/materials",
      subItems: [
        { title: "Materials", path: "/materials" },
        { title: "Inventory", path: "/inventory" },
        { title: "QR Tracking", path: "/inventory-tracking" },
      ]
    },
    {
      title: "Settings",
      path: "/vendor-settings",
      subItems: [
        { title: "Vendor Settings", path: "/vendor-settings" },
        { title: "Hub Integration", path: "/hub" },
      ]
    }
  ];

  // Helper function for Navigation Menu Link
  const NavMenuLink = ({ href, children, isActive }: { href: string, children: React.ReactNode, isActive?: boolean }) => (

              <DropdownMenuItem asChild>
                <Link href="/customer-portal">Customer Portal</Link>
              </DropdownMenuItem>

    <Link href={href}>
      <NavigationMenuLink
        className={cn(
          navigationMenuTriggerStyle(),
          isActive && "bg-accent/50 text-accent-foreground",
          "cursor-pointer text-white"
        )}
      >
        {children}
      </NavigationMenuLink>
    </Link>
  );

  return (
    <header className={cn(
      "fixed top-0 left-0 w-full z-50 transition-all duration-300",
      "bg-white/95 dark:bg-dark-bg/95",
      isScrolled && "shadow-md dark:shadow-lg py-3",
      !isScrolled && "py-5"
    )}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary dark:text-primary dark-glow">
            Jay's Frames Guru
          </h1>
        </div>

        {/* Desktop Navigation Menu */}
        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList>
              {menuStructure.map((menuItem, idx) => (
                <NavigationMenuItem key={idx}>
                  <NavigationMenuTrigger
                    className={cn(
                      "text-white",
                      location === menuItem.path && "text-primary"
                    )}
                  >
                    {menuItem.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 p-4 w-[220px]">
                      {menuItem.subItems.map((subItem, subIdx) => (
                        <li key={subIdx}>
                          <Link href={subItem.path}>
                            <span className={cn(
                              "block select-none rounded-md p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                              location === subItem.path && "bg-accent/50 text-accent-foreground"
                            )}>
                              {subItem.title}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem>
                <Link href="/customers" legacyBehavior passHref>
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-white")}>
                    Customers
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/frame-education" legacyBehavior passHref>
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-white")}>
                    Frame Education
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center space-x-4">
          {/* Cart Widget */}
          <CartWidget />

          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {/* Sun icon for dark mode */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={cn("h-5 w-5", darkMode ? "block" : "hidden")}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>

            {/* Moon icon for light mode */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={cn("h-5 w-5", darkMode ? "hidden" : "block")}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>

          <div className="relative">
            <button className="flex items-center space-x-1">
              <span className="font-medium">Jay</span>
              <img 
                src="/images/toolman-jay-avatar.png" 
                alt="Toolman Jay" 
                className="w-10 h-10 rounded-full border-2 border-primary"
                onError={(e) => {
                  console.error("Failed to load avatar image");
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23718096'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16'%3EJ%3C/text%3E%3C/svg%3E";
                }}
              />
            </button>
          </div>
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <div className={cn("w-6 h-5 flex flex-col justify-between", isMobileMenuOpen && "relative")}>
            <span className={cn(
              "w-full h-0.5 bg-gray-800 transition-all duration-300",
              isMobileMenuOpen && "absolute top-2 rotate-45"
            )}></span>
            <span className={cn(
              "w-full h-0.5 bg-gray-800 transition-all duration-300",
              isMobileMenuOpen && "opacity-0"
            )}></span>
            <span className={cn(
              "w-full h-0.5 bg-gray-800 transition-all duration-300",
              isMobileMenuOpen && "absolute top-2 -rotate-45"
            )}></span>
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        "md:hidden transition-all duration-300",
        isMobileMenuOpen ? "max-h-[70vh]" : "max-h-0"
      )}>
        <nav className="container px-4 py-4 flex flex-col space-y-3 bg-white dark:bg-dark-bg overflow-y-auto max-h-[70vh]">
          {menuStructure.map((menuItem, idx) => (
            <div key={idx} className="py-1">
              <div className="font-medium text-lg mb-1 text-white">{menuItem.title}</div>
              <div className="pl-4 flex flex-col space-y-2">
                {menuItem.subItems.map((subItem, subIdx) => (
                  <Link key={subIdx} href={subItem.path}>
                    <span className={cn(
                      "py-1 font-medium text-white hover:text-primary transition-colors cursor-pointer",
                      location === subItem.path && "text-primary"
                    )}>
                      {subItem.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="py-2 flex items-center">
            <span className="font-medium mr-4">Cart:</span>
            <CartWidget />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;