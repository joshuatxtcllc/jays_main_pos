
// This script migrates existing artwork images from base64 data to files
const { db } = require('../server/db');
const fs = require('fs');
const path = require('path');
const { ensureDir } = require('fs-extra');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const ORDER_IMAGES_DIR = path.join(UPLOAD_DIR, 'order-images');

async function migrateArtworkImages() {
  console.log('Starting artwork image migration...');

  // Ensure directories exist
  await ensureDir(UPLOAD_DIR);
  await ensureDir(ORDER_IMAGES_DIR);

  try {
    // Get all orders with artwork images
    const orders = await db.query('SELECT id, artwork_image FROM orders WHERE artwork_image IS NOT NULL');
    
    console.log(`Found ${orders.rows.length} orders with artwork images to migrate`);
    
    for (const order of orders.rows) {
      const orderId = order.id;
      const artworkImage = order.artwork_image;
      
      if (!artworkImage || !artworkImage.startsWith('data:')) {
        console.log(`Skipping order ${orderId} - no valid image data`);
        continue;
      }
      
      // Create order-specific directory
      const orderDir = path.join(ORDER_IMAGES_DIR, orderId.toString());
      await ensureDir(orderDir);
      
      // Extract and save the image data
      const base64Data = artworkImage.split(',')[1];
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const imagePath = path.join(orderDir, 'artwork.jpg');
      
      fs.writeFileSync(imagePath, imageBuffer);
      
      // Update the order with the new image path
      const relativePath = path.relative(UPLOAD_DIR, imagePath);
      await db.query(
        'UPDATE orders SET artwork_image_path = $1 WHERE id = $2',
        [relativePath, orderId]
      );
      
      console.log(`Migrated artwork image for order ${orderId}`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

migrateArtworkImages();
