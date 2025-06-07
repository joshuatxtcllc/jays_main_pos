
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadResult {
  message: string;
  vendor: string;
  totalItems: number;
  inserted: number;
  updated: number;
  summary?: any;
}

export function XmlPriceSheetUploader() {
  const [vendorName, setVendorName] = useState('');
  const [xmlContent, setXmlContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setXmlContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleUpload = async () => {
    if (!vendorName.trim()) {
      setError('Please enter a vendor name');
      return;
    }

    if (!xmlContent.trim()) {
      setError('Please select an XML file or paste XML content');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const response = await fetch('/api/xml-price-sheets/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          vendorName: vendorName.trim(),
          xmlContent: xmlContent.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      setUploadResult(result);
      
      // Clear form on success
      setVendorName('');
      setXmlContent('');
      
    } catch (err: any) {
      setError(err.message || 'Failed to upload XML price sheet');
    } finally {
      setIsUploading(false);
    }
  };

  const getSupportedFormats = async () => {
    try {
      const response = await fetch('/api/xml-price-sheets/formats', {
        credentials: 'include'
      });
      const formats = await response.json();
      console.log('Supported XML formats:', formats);
    } catch (err) {
      console.error('Error fetching supported formats:', err);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            XML Price Sheet Upload
          </CardTitle>
          <CardDescription>
            Upload vendor XML wholesale price sheets to automatically update your catalog
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vendor-name">Vendor Name</Label>
            <Input
              id="vendor-name"
              placeholder="Enter vendor name (e.g., Larson-Juhl, Roma, etc.)"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="xml-file">XML File Upload</Label>
            <Input
              id="xml-file"
              type="file"
              accept=".xml,.txt"
              onChange={handleFileUpload}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="xml-content">XML Content (or paste here)</Label>
            <Textarea
              id="xml-content"
              placeholder="Paste XML content here or use file upload above..."
              value={xmlContent}
              onChange={(e) => setXmlContent(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {uploadResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p><strong>{uploadResult.message}</strong></p>
                  <p>Vendor: {uploadResult.vendor}</p>
                  <p>Total Items: {uploadResult.totalItems}</p>
                  <p>Inserted: {uploadResult.inserted} | Updated: {uploadResult.updated}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleUpload} 
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Processing...' : 'Upload Price Sheet'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={getSupportedFormats}
            >
              View Supported Formats
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
