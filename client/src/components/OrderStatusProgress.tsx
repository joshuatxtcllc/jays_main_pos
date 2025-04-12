import React, { useEffect, useState } from 'react';
import { Progress } from "@/components/ui/progress";
import { MaterialOrderStatus } from "../types";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, ArrowRightCircle, Truck, HelpCircle, XCircle, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Import from shared schema
import { materialOrderStatuses } from "../../shared/schema";

interface OrderStatusProgressProps {
  status: MaterialOrderStatus;
  className?: string;
}

// Use the materialOrderStatuses from schema.ts
const statusSteps = materialOrderStatuses;

// Description for each status
const statusDescriptions = {
  "needed": "Material identified as needed",
  "pending": "Ready to be ordered",
  "ordered": "Order placed with supplier",
  "shipped": "Shipped from supplier",
  "received": "Received in shop",
  "cancelled": "Order cancelled",
  "back_ordered": "Back-ordered by supplier"
} as Record<MaterialOrderStatus, string>;

// Icon for each status
const StatusIcon: React.FC<{ status: MaterialOrderStatus }> = ({ status }) => {
  switch (status) {
    case "needed":
      return <HelpCircle className="h-5 w-5" />;
    case "pending":
      return <Clock className="h-5 w-5" />;
    case "ordered":
      return <ArrowRightCircle className="h-5 w-5" />;
    case "shipped":
      return <Truck className="h-5 w-5" />;
    case "received":
      return <Check className="h-5 w-5" />;
    case "cancelled":
      return <XCircle className="h-5 w-5" />;
    case "back_ordered":
      return <PackageCheck className="h-5 w-5" />;
    default:
      return <HelpCircle className="h-5 w-5" />;
  }
};

const OrderStatusProgress: React.FC<OrderStatusProgressProps> = ({ status, className }) => {
  const [progressValue, setProgressValue] = useState(0);
  
  // Calculate the progress percentage based on the current status
  useEffect(() => {
    // Special cases
    if (status === "cancelled") {
      setProgressValue(100);
      return;
    }
    
    if (status === "back_ordered") {
      setProgressValue(50); // Halfway through the process
      return;
    }
    
    // For normal flow
    const normalStatuses = statusSteps.filter(s => s !== "cancelled" && s !== "back_ordered");
    const currentIndex = normalStatuses.findIndex(s => s === status);
    
    if (currentIndex === -1) {
      setProgressValue(0);
    } else {
      // Animate progress from 0 to target value
      const targetValue = ((currentIndex + 1) / normalStatuses.length) * 100;
      let startValue = 0;
      
      const animateProgress = () => {
        const interval = setInterval(() => {
          startValue += 2;
          setProgressValue(Math.min(startValue, targetValue));
          
          if (startValue >= targetValue) {
            clearInterval(interval);
          }
        }, 20);
        
        return () => clearInterval(interval);
      };
      
      animateProgress();
    }
  }, [status]);
  
  const getBadgeColor = (orderStatus: MaterialOrderStatus) => {
    switch (orderStatus) {
      case "needed":
        return "bg-slate-500";
      case "pending":
        return "bg-yellow-500";
      case "ordered":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "received":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      case "back_ordered":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <StatusIcon status={status} />
        <Badge className={getBadgeColor(status)}>
          {status.replace('_', ' ')}
        </Badge>
        <motion.span 
          className="text-sm font-medium"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {statusDescriptions[status]}
        </motion.span>
      </div>
      
      <Progress
        value={progressValue}
        className={cn("h-2 w-full", {
          "bg-red-200": status === "cancelled",
          "bg-orange-200": status === "back_ordered"
        })}
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <AnimatePresence>
          {statusSteps.filter(s => s !== "cancelled" && s !== "back_ordered").map((step, index) => (
            <motion.div
              key={step}
              className={cn("flex flex-col items-center", {
                "text-primary font-medium": status === step,
                "text-muted-foreground": status !== step
              })}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center mb-1">
                <div 
                  className={cn("size-2 rounded-full", {
                    "bg-primary": statusSteps.indexOf(step) <= statusSteps.indexOf(status),
                    "bg-muted-foreground": statusSteps.indexOf(step) > statusSteps.indexOf(status)
                  })}
                />
              </div>
              <span className="capitalize">{step}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {(status === "cancelled" || status === "back_ordered") && (
        <motion.div 
          className="text-sm p-2 rounded-md bg-muted"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <p className="font-medium">
            {status === "cancelled" ? "This order has been cancelled" : "This order is back-ordered by the supplier"}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default OrderStatusProgress;