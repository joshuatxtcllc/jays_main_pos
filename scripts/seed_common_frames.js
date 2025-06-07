
const { db } = require('../server/db');
const { frames } = require('../shared/schema');

// Common Larson Juhl frames that customers search for
const commonLarsonFrames = [
  {
    id: 'larson-210285',
    name: 'Larson Academie White',
    manufacturer: 'Larson-Juhl',
    material: 'Wood with White Finish',
    width: '2.25',
    depth: '1.25',
    price: '16.75',
    catalogImage: 'https://www.larsonjuhl.com/contentassets/products/mouldings/210285_fab.jpg',
    color: '#F5F5F5',
    edgeTexture: 'https://www.larsonjuhl.com/contentassets/products/mouldings/210285_edge.jpg',
    corner: 'https://www.larsonjuhl.com/contentassets/products/mouldings/210285_corner.jpg'
  },
  {
    id: 'larson-210286',
    name: 'Larson Academie Black',
    manufacturer: 'Larson-Juhl',
    material: 'Wood with Black Finish',
    width: '2.25',
    depth: '1.25',
    price: '16.75',
    catalogImage: 'https://www.larsonjuhl.com/contentassets/products/mouldings/210286_fab.jpg',
    color: '#2C2C2C',
    edgeTexture: 'https://www.larsonjuhl.com/contentassets/products/mouldings/210286_edge.jpg',
    corner: 'https://www.larsonjuhl.com/contentassets/products/mouldings/210286_corner.jpg'
  },
  {
    id: 'larson-224941',
    name: 'Larson Heritage Natural',
    manufacturer: 'Larson-Juhl',
    material: 'Wood with Natural Finish',
    width: '2.0',
    depth: '1.0',
    price: '14.50',
    catalogImage: 'https://www.larsonjuhl.com/contentassets/products/mouldings/224941_fab.jpg',
    color: '#D2B48C',
    edgeTexture: 'https://www.larsonjuhl.com/contentassets/products/mouldings/224941_edge.jpg',
    corner: 'https://www.larsonjuhl.com/contentassets/products/mouldings/224941_corner.jpg'
  },
  {
    id: 'larson-220941',
    name: 'Larson Gallery Gold',
    manufacturer: 'Larson-Juhl',
    material: 'Wood with Gold Finish',
    width: '1.75',
    depth: '0.875',
    price: '18.25',
    catalogImage: 'https://www.larsonjuhl.com/contentassets/products/mouldings/220941_fab.jpg',
    color: '#FFD700',
    edgeTexture: 'https://www.larsonjuhl.com/contentassets/products/mouldings/220941_edge.jpg',
    corner: 'https://www.larsonjuhl.com/contentassets/products/mouldings/220941_corner.jpg'
  }
];

async function seedCommonFrames() {
  try {
    console.log('Seeding common Larson Juhl frames...');
    
    for (const frame of commonLarsonFrames) {
      // Check if frame already exists
      const existing = await db.select().from(frames).where(eq(frames.id, frame.id)).limit(1);
      
      if (existing.length === 0) {
        await db.insert(frames).values(frame);
        console.log(`Added frame: ${frame.id}`);
      } else {
        // Update existing frame
        await db.update(frames).set(frame).where(eq(frames.id, frame.id));
        console.log(`Updated frame: ${frame.id}`);
      }
    }
    
    console.log('Successfully seeded common frames');
  } catch (error) {
    console.error('Error seeding frames:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedCommonFrames().then(() => process.exit(0));
}

module.exports = { seedCommonFrames };
