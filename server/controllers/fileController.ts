import { Request, Response } from 'express';
import { 
  saveOrderArtworkImage, 
  getOrderArtworkImage, 
  saveOrderFile,
  saveOrderFramePreview
} from '../services/fileStorageService';
import { storage } from '../storage';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module compatibility - add __dirname and __filename polyfills
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Handle artwork image upload
export async function uploadArtworkImage(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({ message: 'No image data provided' });
    }

    // Validate that the order exists
    const order = await storage.getOrder(parseInt(orderId));
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Save the image
    const filePath = await saveOrderArtworkImage(parseInt(orderId), imageData);

    // Return success response
    return res.status(200).json({ 
      message: 'Artwork image saved successfully',
      filePath: path.basename(filePath)
    });
  } catch (error) {
    console.error('Error uploading artwork image:', error);
    return res.status(500).json({ message: 'Error saving artwork image' });
  }
}

// Get artwork image
export async function getArtworkImage(req: Request, res: Response) {
  try {
    const { orderId } = req.params;

    // Validate that the order exists
    const order = await storage.getOrder(parseInt(orderId));
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get the image
    const imageData = await getOrderArtworkImage(parseInt(orderId));

    if (!imageData) {
      return res.status(404).json({ message: 'Artwork image not found' });
    }

    // Set content type and send the image
    res.contentType('image/jpeg');
    return res.send(imageData);
  } catch (error) {
    console.error('Error retrieving artwork image:', error);
    return res.status(500).json({ message: 'Error retrieving artwork image' });
  }
}

// Get all files for an order
export async function getOrderFilesList(req: Request, res: Response) {
  try {
    const { orderId } = req.params;

    // Validate that the order exists
    const order = await storage.getOrder(parseInt(orderId));
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get files from uploads directory for the order
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const orderDir = path.join(uploadsDir, `order-${orderId}`);
    
    let fileInfos: any[] = [];
    if (fs.existsSync(orderDir)) {
      const files = fs.readdirSync(orderDir);
      fileInfos = files.map(file => {
        const filePath = path.join(orderDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          type: determineFileType(file),
          size: stats.size,
          lastModified: stats.mtime
        };
      });
    }

    return res.status(200).json(fileInfos);
  } catch (error) {
    console.error('Error retrieving order files:', error);
    return res.status(500).json({ message: 'Error retrieving order files' });
  }
}

// Helper to determine file type
function determineFileType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.pdf':
      return 'application/pdf';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

// Upload any file for an order
export async function uploadOrderFile(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    const { fileData, fileName, fileType } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).json({ message: 'File data and name are required' });
    }

    // Validate that the order exists
    const order = await storage.getOrder(parseInt(orderId));
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Save the file
    let data: Buffer;
    if (fileData.startsWith('data:')) {
      const base64Data = fileData.split(',')[1];
      data = Buffer.from(base64Data, 'base64');
    } else {
      data = Buffer.from(fileData, 'base64');
    }

    const filePath = await saveOrderFile(parseInt(orderId), data, fileName);

    // Return success response
    return res.status(200).json({ 
      message: 'File saved successfully',
      filePath: path.basename(filePath)
    });
  } catch (error) {
    console.error('Error uploading order file:', error);
    return res.status(500).json({ message: 'Error saving order file' });
  }
}

// Save a frame preview image
export async function saveFramePreview(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    const { previewData } = req.body;

    if (!previewData) {
      return res.status(400).json({ message: 'No preview data provided' });
    }

    // Validate that the order exists
    const order = await storage.getOrder(parseInt(orderId));
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Save the preview
    const filePath = await saveOrderFramePreview(parseInt(orderId), previewData);

    // Return success response
    return res.status(200).json({ 
      message: 'Frame preview saved successfully',
      filePath: path.basename(filePath)
    });
  } catch (error) {
    console.error('Error saving frame preview:', error);
    return res.status(500).json({ message: 'Error saving frame preview' });
  }
}
// Multer setup for file uploads
import multer from 'multer';
import { Express } from 'express';
import { FileFilterCallback } from 'multer';

const fileStorage = multer.diskStorage({
  destination: function(req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    const orderId = req.params.orderId || req.body.orderId;
    const uploadDir = path.join(__dirname, '../../uploads', orderId);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function(req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${file.fieldname}${fileExt}`;
    cb(null, fileName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF files are allowed.'));
  }
};

export const upload = multer({ 
  storage: fileStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter
});

// Upload artwork for an order with multer
export const uploadOrderArtwork = async (req: Request, res: Response) => {
  const orderId = req.params.orderId;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path.replace(/\\/g, '/').replace('uploads/', '');

    // Store artwork information (simplified for deployment)
    console.log(`Artwork uploaded for order ${orderId}: ${filePath}`);

    res.status(200).json({ 
      message: 'Artwork uploaded successfully',
      file: {
        path: filePath,
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading artwork:', error);
    res.status(500).json({ message: 'Failed to upload artwork' });
  }
};

// Get all files for an order with multer metadata
export const getOrderFiles = async (req: Request, res: Response) => {
  const orderId = req.params.orderId;

  try {
    // Simplified file retrieval for deployment
    const uploadsDir = path.join(process.cwd(), 'uploads', `order-${orderId}`);
    let files: any[] = [];
    
    if (fs.existsSync(uploadsDir)) {
      const fileNames = fs.readdirSync(uploadsDir);
      files = fileNames.map(fileName => ({
        name: fileName,
        path: path.join(uploadsDir, fileName),
        type: fileName.split('.').pop() || 'unknown'
      }));
    }
    res.status(200).json(files);
  } catch (error) {
    console.error('Error retrieving order files:', error);
    res.status(500).json({ message: 'Failed to retrieve order files' });
  }
};

// Delete an order file
export const deleteOrderFile = async (req: Request, res: Response) => {
  const { orderId, fileId } = req.params;

  try {
    // Simplified file deletion for deployment
    const uploadsDir = path.join(process.cwd(), 'uploads', `order-${orderId}`);
    const filePath = path.join(uploadsDir, fileId);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
};