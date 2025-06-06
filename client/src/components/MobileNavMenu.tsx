
import React, { useState } from 'react';
import { Link } from 'wouter';
import { Menu, X, Home, Package, ShoppingCart, Users, Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface MobileNavMenuProps {
  className?: string;
}

export default function MobileNavMenu({ className = '' }: MobileNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/pos-system', label: 'POS System', icon: ShoppingCart },
    { to: '/orders', label: 'Orders', icon: Package },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/inventory', label: 'Inventory', icon: BarChart3 },
    { to: '/production', label: 'Production', icon: Settings },
  ];

  return (
    <div className={`md:hidden ${className}`}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-200">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center space-x-2">
                <img 
                  src="/images/toolman-jay-avatar.png" 
                  alt="Jay's Frames" 
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-lg font-bold">Jay's Frames</span>
              </Link>
            </div>
            
            {/* Navigation Items */}
            <nav className="flex-1 py-4">
              <ul className="space-y-2 px-4">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <li key={item.to}>
                      <Link to={item.to} onClick={() => setIsOpen(false)}>
                        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <IconComponent className="h-5 w-5" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
