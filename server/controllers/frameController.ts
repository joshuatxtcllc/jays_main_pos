import { Request, Response } from 'express';
import { db } from '../db';
import { frames } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Fetches all frames from the database
 */
export async function getAllFrames(req: Request, res: Response) {
  try {
    let allFrames = await db.select().from(frames);
    
    // Add default colors to frames if they don't have them
    if (allFrames.length > 0 && !allFrames[0].color) {
      console.log("Adding default colors to frames");
      
      const defaultColors = {
        "Gold": "#D4AF37",
        "Silver": "#C0C0C0",
        "Black": "#2D2D2D",
        "White": "#F5F5F5",
        "Brown": "#8B4513",
        "Walnut": "#5C4033",
        "Cherry": "#722F37",
        "Mahogany": "#4E2728",
        "Oak": "#D8BE75",
        "Natural": "#E5D3B3"
      };
      
      // Update frames with colors based on their names
      for (const frame of allFrames) {
        let frameColor = "#8B4513"; // Default medium brown
        
        // Find a matching color based on the frame name
        for (const [colorName, hexColor] of Object.entries(defaultColors)) {
          if (frame.name.toLowerCase().includes(colorName.toLowerCase())) {
            frameColor = hexColor;
            break;
          }
        }
        
        // Update the frame in the database with the assigned color
        await db.update(frames)
          .set({ color: frameColor })
          .where(eq(frames.id, frame.id));
      }
      
      // Fetch updated frames
      allFrames = await db.select().from(frames);
    }
    
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