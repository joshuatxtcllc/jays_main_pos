
import React, { useState, useEffect } from 'react';
import { getOrderFiles } from '@/services/fileService';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatBytes } from '@/lib/utils';
import { Download, FileIcon, Image, FileText, FilePdf } from 'lucide-react';

interface OrderFilesProps {
  orderId: number;
}

export default function OrderFiles({ orderId }: OrderFilesProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFiles() {
      try {
        setLoading(true);
        const orderFiles = await getOrderFiles(orderId);
        setFiles(orderFiles);
        setError(null);
      } catch (err) {
        console.error('Error loading order files:', err);
        setError('Failed to load files. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, [orderId]);

  // Helper to get icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (fileType === 'application/pdf') {
      return <FilePdf className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  // Helper to format file date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Handle file download
  const handleDownload = (filePath: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = `/api/files/orders/${orderId}/files/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Files</CardTitle>
          <CardDescription>
            Loading files...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Files</CardTitle>
          <CardDescription>
            Error loading files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Files</CardTitle>
        <CardDescription>
          All files associated with this order
        </CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No files found for this order.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file, index) => (
                <TableRow key={index}>
                  <TableCell>{getFileIcon(file.type)}</TableCell>
                  <TableCell>{file.name}</TableCell>
                  <TableCell>{formatBytes(file.size)}</TableCell>
                  <TableCell>{formatDate(file.lastModified)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownload(file.path, file.name)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
