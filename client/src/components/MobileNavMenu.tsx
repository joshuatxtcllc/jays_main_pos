import { useState } from 'react';
import { Menu, X, Home, ShoppingCart, Package, BarChart3, Settings, User } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function MobileNavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/pos', label: 'POS System', icon: ShoppingCart },
    { path: '/production', label: 'Production', icon: Package },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-white">
          <SheetHeader>
            <SheetTitle className="text-left text-lg font-bold text-gray-800">
              Jay's Frames
            </SheetTitle>
          </SheetHeader>
          <nav className="mt-6">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start gap-3 h-12 ${
                          isActive 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={handleNavClick}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </Button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="text-xs text-gray-500 text-center">
              Version 1.0.0
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}