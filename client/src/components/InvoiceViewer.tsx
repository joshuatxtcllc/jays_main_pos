import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Invoice from './Invoice';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface InvoiceViewerProps {
  orderId: number;
  onBack?: () => void;
  qrCodeData?: string | null;
}

const InvoiceViewer: React.FC<InvoiceViewerProps> = ({ 
  orderId,
  onBack,
  qrCodeData
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [_, setLocation] = useLocation();
  const params = useParams();

  // Use either the prop or the URL parameter
  const groupId = orderId || Number(params.orderId);

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/invoices/${groupId}`],
    queryFn: async () => {
      if (!groupId) return null;
      const response = await fetch(`/api/invoices/${groupId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoice data');
      }
      return response.json();
    },
    enabled: !!groupId
  });

  const handleClose = () => {
    setIsOpen(false);
    if (onBack) {
      onBack();
    } else {
      // Default behavior is to go back to the previous page
      setLocation('/orders');
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading invoice...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !data) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <div className="flex flex-col justify-center items-center p-12">
            <p className="text-red-500">Error loading invoice</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Unable to fetch invoice data'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <Invoice 
          orders={data.orders}
          customer={data.customer}
          orderGroup={data.orderGroup}
          onClose={handleClose}
          qrCodeData={qrCodeData} // Pass the QR code data
        />
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceViewer;