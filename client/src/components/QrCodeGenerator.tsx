import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCodeType, qrCodeTypes } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface QrCodeGeneratorProps {
  type?: QrCodeType;
  entityId?: string;
  title?: string;
  description?: string;
  onGenerate?: (qrCode: any) => void;
  className?: string;
}

export function QrCodeGenerator({
  type: initialType = 'inventory_location',
  entityId: initialEntityId = '',
  title: initialTitle = '',
  description: initialDescription = '',
  onGenerate,
  className
}: QrCodeGeneratorProps) {
  const [qrCodeData, setQrCodeData] = useState('');
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [type, setType] = useState<QrCodeType>(initialType);
  const [entityId, setEntityId] = useState(initialEntityId);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [qrCode, setQrCode] = useState<any>(null);
  const { toast } = useToast();

  const generateQrCode = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the QR code",
        variant: "destructive"
      });
      return;
    }

    if (!entityId.trim()) {
      toast({
        title: "Error",
        description: "Please enter an entity ID",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/qr-codes', {
        type,
        entityId,
        title,
        description,
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const data = await response.json();
      setQrCode(data);
      setQrCodeData(data.code);
      setGenerated(true);

      if (onGenerate) {
        onGenerate(data);
      }

      toast({
        title: "QR Code Generated",
        description: `QR code for "${title}" has been created successfully.`
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: `Failed to generate QR code: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQrCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create a link element and trigger download
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `qrcode-${type}-${entityId}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const printQrCode = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const svg = document.getElementById('qr-code-svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>QR Code: ${title}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  padding: 20px;
                }
                .container {
                  max-width: 400px;
                  text-align: center;
                }
                .qr-code {
                  margin: 20px 0;
                }
                .title {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 8px;
                }
                .code {
                  font-family: monospace;
                  margin-bottom: 10px;
                }
                .description {
                  color: #555;
                  margin-bottom: 10px;
                }
                .type {
                  font-size: 12px;
                  color: #777;
                }
                @media print {
                  body {
                    margin: 0;
                    padding: 0;
                  }
                  button {
                    display: none;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="title">${title}</div>
                <div class="code">${qrCodeData}</div>
                <div class="qr-code">${svgData}</div>
                <div class="description">${description}</div>
                <div class="type">Type: ${type}</div>
                <button onclick="window.print();return false;">Print</button>
              </div>
              <script>
                // Auto-print
                setTimeout(() => {
                  window.print();
                }, 500);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>QR Code Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="qr-type">QR Code Type</Label>
            <Select value={type} onValueChange={(value: QrCodeType) => setType(value)}>
              <SelectTrigger id="qr-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {qrCodeTypes.map((codeType) => (
                  <SelectItem key={codeType} value={codeType}>
                    {codeType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="qr-entity-id">Entity ID</Label>
            <Input
              id="qr-entity-id"
              placeholder="Enter entity ID"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="qr-title">Title</Label>
            <Input
              id="qr-title"
              placeholder="Enter QR code title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="qr-description">Description (Optional)</Label>
            <Input
              id="qr-description"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {generated && qrCodeData && (
            <div className="flex flex-col items-center mt-4">
              <div id="qr-code-container" className="bg-white p-4 rounded-md">
                <QRCode id="qr-code-svg" value={qrCodeData} size={200} level="H" />
              </div>
              <div className="text-center mt-2 font-mono text-sm">{qrCodeData}</div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setGenerated(false)} disabled={!generated || loading}>
          Reset
        </Button>
        {!generated ? (
          <Button onClick={generateQrCode} disabled={loading}>
            {loading ? 'Generating...' : 'Generate QR Code'}
          </Button>
        ) : (
          <div className="space-x-2">
            <Button variant="outline" onClick={printQrCode} disabled={loading}>
              Print
            </Button>
            <Button variant="secondary" onClick={downloadQrCode} disabled={loading}>
              Download
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default QrCodeGenerator;