import { Request, Response } from 'express';
import { db } from '../db';
import { qrCodes, qrCodeScans, materialLocations, insertQrCodeSchema, insertQrCodeScanSchema } from '@shared/schema';
import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';

// Generate a unique QR code identifier
function generateQrCode(): string {
  // JF (Jay's Frames) + random bytes encoded as hex (8 characters)
  return `JF${randomBytes(4).toString('hex')}`;
}

// Get all QR codes
export async function getAllQrCodes(req: Request, res: Response) {
  try {
    const allQrCodes = await db.select().from(qrCodes).orderBy(qrCodes.createdAt);
    return res.status(200).json(allQrCodes);
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    return res.status(500).json({ message: 'Error fetching QR codes' });
  }
}

// Get QR code by ID
export async function getQrCodeById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const qrCode = await db.select().from(qrCodes).where(eq(qrCodes.id, parseInt(id))).limit(1);
    
    if (qrCode.length === 0) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    
    return res.status(200).json(qrCode[0]);
  } catch (error) {
    console.error('Error fetching QR code:', error);
    return res.status(500).json({ message: 'Error fetching QR code' });
  }
}

// Get QR code by code value
export async function getQrCodeByCode(req: Request, res: Response) {
  try {
    const { code } = req.params;
    const qrCode = await db.select().from(qrCodes).where(eq(qrCodes.code, code)).limit(1);
    
    if (qrCode.length === 0) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    
    return res.status(200).json(qrCode[0]);
  } catch (error) {
    console.error('Error fetching QR code:', error);
    return res.status(500).json({ message: 'Error fetching QR code' });
  }
}

// Create a new QR code
export async function createQrCode(req: Request, res: Response) {
  try {
    const validatedData = insertQrCodeSchema.parse(req.body);
    
    // Generate a unique QR code if not provided
    if (!validatedData.code) {
      validatedData.code = generateQrCode();
    }
    
    // Check if the code already exists
    const existingCode = await db.select({ id: qrCodes.id })
      .from(qrCodes)
      .where(eq(qrCodes.code, validatedData.code))
      .limit(1);
    
    if (existingCode.length > 0) {
      return res.status(400).json({ message: 'QR code already exists' });
    }
    
    // Create the QR code
    const [newQrCode] = await db.insert(qrCodes)
      .values(validatedData)
      .returning();
    
    return res.status(201).json(newQrCode);
  } catch (error) {
    console.error('Error creating QR code:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid QR code data', errors: error.errors });
    }
    return res.status(500).json({ message: 'Error creating QR code' });
  }
}

// Record a QR code scan
export async function recordQrCodeScan(req: Request, res: Response) {
  try {
    const validatedData = insertQrCodeScanSchema.parse(req.body);
    
    // Check if the QR code exists
    const qrCode = await db.select()
      .from(qrCodes)
      .where(eq(qrCodes.id, validatedData.qrCodeId))
      .limit(1);
    
    if (qrCode.length === 0) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    
    // Record the scan
    const [scan] = await db.insert(qrCodeScans)
      .values(validatedData)
      .returning();
    
    // Update the QR code's last scanned time and increment scan count
    await db.update(qrCodes)
      .set({
        lastScanned: new Date(),
        scanCount: qrCode[0].scanCount + 1
      })
      .where(eq(qrCodes.id, validatedData.qrCodeId));
    
    return res.status(201).json(scan);
  } catch (error) {
    console.error('Error recording QR code scan:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid scan data', errors: error.errors });
    }
    return res.status(500).json({ message: 'Error recording QR code scan' });
  }
}

// Get all scans for a QR code
export async function getQrCodeScans(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const scans = await db.select()
      .from(qrCodeScans)
      .where(eq(qrCodeScans.qrCodeId, parseInt(id)))
      .orderBy(qrCodeScans.scannedAt);
    
    return res.status(200).json(scans);
  } catch (error) {
    console.error('Error fetching QR code scans:', error);
    return res.status(500).json({ message: 'Error fetching QR code scans' });
  }
}

// Link a QR code to a material location
export async function linkQrCodeToMaterialLocation(req: Request, res: Response) {
  try {
    const { qrCodeId, materialLocationId } = req.body;
    
    // Check if the QR code exists
    const qrCode = await db.select()
      .from(qrCodes)
      .where(eq(qrCodes.id, qrCodeId))
      .limit(1);
    
    if (qrCode.length === 0) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    
    // Check if the material location exists
    const location = await db.select()
      .from(materialLocations)
      .where(eq(materialLocations.id, materialLocationId))
      .limit(1);
    
    if (location.length === 0) {
      return res.status(404).json({ message: 'Material location not found' });
    }
    
    // Update the material location with the QR code ID
    const [updatedLocation] = await db.update(materialLocations)
      .set({ qrCodeId })
      .where(eq(materialLocations.id, materialLocationId))
      .returning();
    
    return res.status(200).json(updatedLocation);
  } catch (error) {
    console.error('Error linking QR code to material location:', error);
    return res.status(500).json({ message: 'Error linking QR code to material location' });
  }
}

// Delete a QR code
export async function deleteQrCode(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Check if the QR code exists
    const qrCode = await db.select()
      .from(qrCodes)
      .where(eq(qrCodes.id, parseInt(id)))
      .limit(1);
    
    if (qrCode.length === 0) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    
    // Delete the QR code scans first (due to foreign key constraint)
    await db.delete(qrCodeScans)
      .where(eq(qrCodeScans.qrCodeId, parseInt(id)));
    
    // Delete the QR code
    await db.delete(qrCodes)
      .where(eq(qrCodes.id, parseInt(id)));
    
    return res.status(200).json({ message: 'QR code deleted successfully' });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    return res.status(500).json({ message: 'Error deleting QR code' });
  }
}