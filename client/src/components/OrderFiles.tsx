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
import { apiRequest } from '@/lib/queryClient';
import { Download, FileIcon, Image, FileText, FileType } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { QrCodeIcon, DownloadIcon, TrashIcon, UploadIcon, ImageIcon, FileTextIcon, FileCheck2Icon } from 'lucide-react';

// First component interface
interface OrderFilesProps {
  orderId: number;
}

// Second component interface 
interface EnhancedOrderFilesProps {
  orderId: string;
  onFileUploaded?: () => void;
}

interface OrderFile {
  id: string;
  file_name: string;
  file_type: string;
  mime_type: string;
  file_path: string;
  upload_date: string;
  file_size: number;
}

// Original OrderFiles component
export function SimpleOrderFiles({ orderId }: OrderFilesProps) {
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
      return <FileType className="h-4 w-4" />;
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

// Enhanced OrderFiles component (default export)
const OrderFiles: React.FC<EnhancedOrderFilesProps> = ({ orderId, onFileUploaded }) => {
  const toast = useToast();
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [activeTab, setActiveTab] = useState<string>('artwork');
  const [uploading, setUploading] = useState<boolean>(false);
  const [fileType, setFileType] = useState<string>('other');
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [additionalFile, setAdditionalFile] = useState<File | null>(null);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(true);

  // Fetch all files for this order
  const fetchFiles = async () => {
    try {
      setLoadingFiles(true);
      const response = await apiRequest('GET', `/api/orders/${orderId}/files`);

      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      } else {
        console.error('Error fetching files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchFiles();
    }
  }, [orderId]);

  // Handle artwork file selection
  const handleArtworkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArtworkFile(e.target.files[0]);
    }
  };

  // Handle additional file selection
  const handleAdditionalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAdditionalFile(e.target.files[0]);
    }
  };

  // Upload artwork
  const uploadArtwork = async () => {
    if (!artworkFile) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('artwork', artworkFile);

      const response = await apiRequest(
        'POST', 
        `/api/orders/${orderId}/artwork`, 
        undefined, 
        formData,
        false
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Artwork uploaded successfully',
        });
        setArtworkFile(null);
        fetchFiles();
        if (onFileUploaded) onFileUploaded();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Upload Failed',
          description: errorData.message || 'Failed to upload artwork',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error uploading artwork:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while uploading',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // Upload additional file
  const uploadAdditionalFile = async () => {
    if (!additionalFile) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', additionalFile);
      formData.append('fileType', fileType);

      const response = await apiRequest(
        'POST', 
        `/api/orders/${orderId}/files`, 
        undefined, 
        formData,
        false
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'File uploaded successfully',
        });
        setAdditionalFile(null);
        fetchFiles();
        if (onFileUploaded) onFileUploaded();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Upload Failed',
          description: errorData.message || 'Failed to upload file',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while uploading',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // Delete a file
  const deleteFile = async (fileId: string) => {
    try {
      const response = await apiRequest('DELETE', `/api/files/${fileId}`);

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'File deleted successfully',
        });

        // Update local state
        setFiles(files.filter(file => file.id !== fileId));
      } else {
        const errorData = await response.json();
        toast({
          title: 'Delete Failed',
          description: errorData.message || 'Failed to delete file',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the file',
        variant: 'destructive',
      });
    }
  };

  // Download a file
  const downloadFile = (file: OrderFile) => {
    const baseUrl = window.location.origin;
    const fileUrl = `${baseUrl}/uploads/${file.file_path}`;

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get file type icon
  const getFileIcon = (fileType: string, mimeType: string) => {
    switch (fileType) {
      case 'qr-code':
        return <QrCodeIcon className="h-5 w-5" />;
      case 'work-order':
        return <FileTextIcon className="h-5 w-5" />;
      case 'invoice':
        return <FileCheck2Icon className="h-5 w-5" />;
      case 'virtual-frame':
        return <ImageIcon className="h-5 w-5" />;
      default:
        return mimeType.startsWith('image/') 
          ? <ImageIcon className="h-5 w-5" /> 
          : <FileIcon className="h-5 w-5" />;
    }
  };

  // Get size formatted for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Get date formatted for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Filter files by type
  const getFilteredFiles = () => {
    if (activeTab === 'artwork') {
      return files.filter(file => 
        file.mime_type.startsWith('image/') && file.file_type !== 'qr-code' && file.file_type !== 'virtual-frame'
      );
    } else if (activeTab === 'qr-codes') {
      return files.filter(file => file.file_type === 'qr-code');
    } else if (activeTab === 'documents') {
      return files.filter(file => 
        file.file_type === 'work-order' || 
        file.file_type === 'invoice' || 
        file.mime_type === 'application/pdf'
      );
    } else {
      return files.filter(file => 
        file.file_type === 'other' && 
        !file.mime_type.startsWith('image/') && 
        file.mime_type !== 'application/pdf'
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Order Files</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="artwork" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="artwork">Artwork</TabsTrigger>
            <TabsTrigger value="qr-codes">QR Codes</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="other">Other Files</TabsTrigger>
          </TabsList>

          {/* Artwork Tab */}
          <TabsContent value="artwork">
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Upload Artwork</h3>
                <div className="flex items-center gap-2">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleArtworkFileChange} 
                    className="flex-1"
                  />
                  <Button 
                    onClick={uploadArtwork}
                    disabled={!artworkFile || uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload'} <UploadIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                {artworkFile && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {artworkFile.name} ({formatFileSize(artworkFile.size)})
                  </p>
                )}
              </div>

              <div className="file-list">
                {loadingFiles ? (
                  <div className="text-center py-4">Loading files...</div>
                ) : getFilteredFiles().length > 0 ? (
                  <div className="grid gap-2">
                    {getFilteredFiles().map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-white border rounded-md">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.file_type, file.mime_type)}
                          <div>
                            <p className="text-sm font-medium">{file.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.file_size)} • {formatDate(file.upload_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => downloadFile(file)}
                          >
                            <DownloadIcon className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <TrashIcon className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete File</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{file.file_name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteFile(file.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No artwork files uploaded</div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Other Tabs have similar structure */}
          <TabsContent value="qr-codes">
            <div className="space-y-4">
              {/* File List */}
              <div className="file-list">
                {loadingFiles ? (
                  <div className="text-center py-4">Loading files...</div>
                ) : getFilteredFiles().length > 0 ? (
                  <div className="grid gap-2">
                    {getFilteredFiles().map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-white border rounded-md">
                        <div className="flex items-center gap-3">
                          <QrCodeIcon className="h-5 w-5" />
                          <div>
                            <p className="text-sm font-medium">{file.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.file_size)} • {formatDate(file.upload_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => downloadFile(file)}
                          >
                            <DownloadIcon className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <TrashIcon className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete File</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{file.file_name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteFile(file.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No QR codes uploaded</div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Upload Document</h3>
                <div className="grid gap-2">
                  <Select value={fileType} onValueChange={setFileType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select file type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work-order">Work Order</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="other">Other Document</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="file" 
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" 
                      onChange={handleAdditionalFileChange} 
                      className="flex-1"
                    />
                    <Button 
                      onClick={uploadAdditionalFile}
                      disabled={!additionalFile || uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload'} <UploadIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {additionalFile && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {additionalFile.name} ({formatFileSize(additionalFile.size)})
                  </p>
                )}
              </div>

              {/* File List */}
              <div className="file-list">
                {loadingFiles ? (
                  <div className="text-center py-4">Loading files...</div>
                ) : getFilteredFiles().length > 0 ? (
                  <div className="grid gap-2">
                    {getFilteredFiles().map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-white border rounded-md">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.file_type, file.mime_type)}
                          <div>
                            <p className="text-sm font-medium">{file.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.file_size)} • {formatDate(file.upload_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => downloadFile(file)}
                          >
                            <DownloadIcon className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <TrashIcon className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete File</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{file.file_name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteFile(file.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No documents uploaded</div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="other">
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Upload Other File</h3>
                <div className="grid gap-2">
                  <Select value={fileType} onValueChange={setFileType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select file type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="virtual-frame">Virtual Frame Design</SelectItem>
                      <SelectItem value="other">Other File</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="file" 
                      onChange={handleAdditionalFileChange} 
                      className="flex-1"
                    />
                    <Button 
                      onClick={uploadAdditionalFile}
                      disabled={!additionalFile || uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload'} <UploadIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {additionalFile && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {additionalFile.name} ({formatFileSize(additionalFile.size)})
                  </p>
                )}
              </div>

              {/* File List */}
              <div className="file-list">
                {loadingFiles ? (
                  <div className="text-center py-4">Loading files...</div>
                ) : getFilteredFiles().length > 0 ? (
                  <div className="grid gap-2">
                    {getFilteredFiles().map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-white border rounded-md">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.file_type, file.mime_type)}
                          <div>
                            <p className="text-sm font-medium">{file.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.file_size)} • {formatDate(file.upload_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => downloadFile(file)}
                          >
                            <DownloadIcon className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <TrashIcon className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete File</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{file.file_name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteFile(file.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No other files uploaded</div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OrderFiles;