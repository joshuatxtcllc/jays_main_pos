import { Request, Response } from 'express';
import { db } from '../db';
import { frames } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Fetches all frames from the database
 */
export async function getAllFrames(req: Request, res: Response) {
  try {
    const allFrames = await db.select().from(frames);
    res.json(allFrames);
  } catch (error) {
    console.error('Error fetching frames:', error);
    res.status(500).json({ error: 'Failed to fetch frames' });
  }
}

/**
 * Fetches a frame by ID
 */
export async function getFrameById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const [frame] = await db.select().from(frames).where(eq(frames.id, id));
    
    if (!frame) {
      return res.status(404).json({ error: 'Frame not found' });
    }
    
    res.json(frame);
  } catch (error) {
    console.error('Error fetching frame by ID:', error);
    res.status(500).json({ error: 'Failed to fetch frame' });
  }
}

/**
 * Fetches frames by manufacturer
 */
export async function getFramesByManufacturer(req: Request, res: Response) {
  try {
    const { manufacturer } = req.params;
    
    const manufacturerFrames = await db.select().from(frames).where(eq(frames.manufacturer, manufacturer));
    
    res.json(manufacturerFrames);
  } catch (error) {
    console.error('Error fetching frames by manufacturer:', error);
    res.status(500).json({ error: 'Failed to fetch frames by manufacturer' });
  }
}