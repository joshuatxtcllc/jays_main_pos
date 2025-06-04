
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { Printer, Download } from 'lucide-react';

interface WorkOrderProps {
  order: {
    id: number;
    orderNumber?: string;
    customerName: string;
    artworkWidth: number;
    artworkHeight: number;
    artworkDescription?: string;
    artworkType?: string;
    frameName?: string;
    matDescription?: string;
    glassType?: string;
    specialServices?: string[];
    dueDate?: string;
    status: string;
    total: string;
    createdAt: string;
    artworkImage?: string;
  };
}

export function WorkOrder({ order }: WorkOrderProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a blob with the work order HTML
    const workOrderHtml = generateWorkOrderHtml();
    const blob = new Blob([workOrderHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `work-order-${order.orderNumber || order.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateWorkOrderHtml = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Work Order - ${order.orderNumber || order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .artwork-image { max-width: 200px; max-height: 200px; border: 1px solid #ccc; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>JAY'S FRAMES - WORK ORDER</h1>
          <h2>Order #${order.orderNumber || order.id}</h2>
        </div>
        <div class="grid">
          <div>
            <div class="section">
              <div class="label">Customer:</div>
              <div>${order.customerName}</div>
            </div>
            <div class="section">
              <div class="label">Artwork Dimensions:</div>
              <div>${order.artworkWidth}" × ${order.artworkHeight}"</div>
            </div>
            <div class="section">
              <div class="label">Artwork Description:</div>
              <div>${order.artworkDescription || 'N/A'}</div>
            </div>
            <div class="section">
              <div class="label">Artwork Type:</div>
              <div>${order.artworkType || 'N/A'}</div>
            </div>
          </div>
          <div>
            <div class="section">
              <div class="label">Frame:</div>
              <div>${order.frameName || 'N/A'}</div>
            </div>
            <div class="section">
              <div class="label">Mat:</div>
              <div>${order.matDescription || 'N/A'}</div>
            </div>
            <div class="section">
              <div class="label">Glass:</div>
              <div>${order.glassType || 'N/A'}</div>
            </div>
            <div class="section">
              <div class="label">Special Services:</div>
              <div>${order.specialServices?.join(', ') || 'None'}</div>
            </div>
          </div>
        </div>
        ${order.artworkImage ? `
          <div class="section">
            <div class="label">Artwork Reference:</div>
            <img src="${order.artworkImage}" alt="Artwork" class="artwork-image" />
          </div>
        ` : ''}
        <div class="section">
          <div class="label">Due Date:</div>
          <div>${order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'Not set'}</div>
        </div>
        <div class="section">
          <div class="label">Order Total:</div>
          <div style="font-size: 18px; font-weight: bold;">${formatCurrency(parseFloat(order.total))}</div>
        </div>
        <div class="section">
          <div class="label">Production Notes:</div>
          <div style="height: 100px; border: 1px solid #ccc; margin-top: 5px;"></div>
        </div>
        <div class="section">
          <div class="label">Quality Check:</div>
          <div style="margin-top: 10px;">
            □ Frame cut and assembled<br/>
            □ Mat cut and beveled<br/>
            □ Glass cut and cleaned<br/>
            □ Artwork mounted<br/>
            □ Hardware attached<br/>
            □ Final inspection<br/>
            □ Ready for pickup
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center border-b">
        <CardTitle className="text-2xl font-bold">JAY'S FRAMES - WORK ORDER</CardTitle>
        <div className="text-xl font-semibold">Order #{order.orderNumber || order.id}</div>
        <div className="flex justify-center gap-2 mt-4">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <div className="font-semibold text-sm text-gray-600">Customer</div>
              <div className="text-lg">{order.customerName}</div>
            </div>
            
            <div>
              <div className="font-semibold text-sm text-gray-600">Artwork Dimensions</div>
              <div className="text-lg">{order.artworkWidth}" × {order.artworkHeight}"</div>
            </div>
            
            <div>
              <div className="font-semibold text-sm text-gray-600">Artwork Description</div>
              <div>{order.artworkDescription || 'N/A'}</div>
            </div>
            
            <div>
              <div className="font-semibold text-sm text-gray-600">Artwork Type</div>
              <div>{order.artworkType || 'N/A'}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="font-semibold text-sm text-gray-600">Frame</div>
              <div>{order.frameName || 'N/A'}</div>
            </div>
            
            <div>
              <div className="font-semibold text-sm text-gray-600">Mat</div>
              <div>{order.matDescription || 'N/A'}</div>
            </div>
            
            <div>
              <div className="font-semibold text-sm text-gray-600">Glass</div>
              <div>{order.glassType || 'N/A'}</div>
            </div>
            
            <div>
              <div className="font-semibold text-sm text-gray-600">Special Services</div>
              <div>{order.specialServices?.join(', ') || 'None'}</div>
            </div>
          </div>
        </div>

        {order.artworkImage && (
          <div className="mb-6">
            <div className="font-semibold text-sm text-gray-600 mb-2">Artwork Reference</div>
            <img 
              src={order.artworkImage} 
              alt="Artwork" 
              className="max-w-xs max-h-48 border border-gray-300 rounded"
            />
          </div>
        )}

        <Separator className="my-6" />
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="font-semibold text-sm text-gray-600">Due Date</div>
            <div className="text-lg">
              {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'Not set'}
            </div>
          </div>
          
          <div>
            <div className="font-semibold text-sm text-gray-600">Order Total</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(parseFloat(order.total))}
            </div>
          </div>
        </div>

        <Separator className="my-6" />
        
        <div className="mb-6">
          <div className="font-semibold text-sm text-gray-600 mb-2">Production Notes</div>
          <div className="h-24 border border-gray-300 rounded p-2 bg-gray-50"></div>
        </div>
        
        <div>
          <div className="font-semibold text-sm text-gray-600 mb-3">Quality Checklist</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="frame-cut" />
              <label htmlFor="frame-cut">Frame cut and assembled</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="mat-cut" />
              <label htmlFor="mat-cut">Mat cut and beveled</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="glass-cut" />
              <label htmlFor="glass-cut">Glass cut and cleaned</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="artwork-mounted" />
              <label htmlFor="artwork-mounted">Artwork mounted</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="hardware" />
              <label htmlFor="hardware">Hardware attached</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="inspection" />
              <label htmlFor="inspection">Final inspection</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ready" />
              <label htmlFor="ready">Ready for pickup</label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
