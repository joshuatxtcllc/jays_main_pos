import { Frame, MatColor } from '@shared/schema';

// Production-ready pricing engine with authentic wholesale calculations
export class ProductionPricingEngine {
  
  // Industry-standard markup brackets for frames (based on wholesale cost)
  private static FRAME_MARKUP_BRACKETS = [
    { min: 0, max: 1.99, markup: 4.0 },
    { min: 2.00, max: 3.99, markup: 3.5 },
    { min: 4.00, max: 5.99, markup: 3.2 },
    { min: 6.00, max: 9.99, markup: 3.0 },
    { min: 10.00, max: 14.99, markup: 2.8 },
    { min: 15.00, max: 19.99, markup: 2.6 },
    { min: 20.00, max: 29.99, markup: 2.4 },
    { min: 30.00, max: 49.99, markup: 2.2 },
    { min: 50.00, max: 99.99, markup: 2.0 },
    { min: 100.00, max: Infinity, markup: 1.8 }
  ];

  // Glass pricing tiers based on square footage
  private static GLASS_SIZE_BRACKETS = [
    { min: 0, max: 100, multiplier: 1.0 },      // Small pieces
    { min: 101, max: 300, multiplier: 1.2 },   // Medium pieces  
    { min: 301, max: 600, multiplier: 1.4 },   // Large pieces
    { min: 601, max: 1200, multiplier: 1.6 },  // Extra large
    { min: 1201, max: Infinity, multiplier: 1.8 } // Oversized
  ];

  // Mat pricing based on square inches with authentic markup
  private static MAT_SIZE_BRACKETS = [
    { min: 0, max: 200, markup: 3.5 },
    { min: 201, max: 400, markup: 3.2 },
    { min: 401, max: 800, markup: 3.0 },
    { min: 801, max: 1600, markup: 2.8 },
    { min: 1601, max: Infinity, markup: 2.5 }
  ];

  // Calculate authentic frame pricing using united inch methodology
  static calculateFramePrice(frame: Frame, artworkWidth: number, artworkHeight: number, pricingMethod: string = 'chop'): number {
    const wholesalePrice = parseFloat(frame.price) || 0;
    
    if (pricingMethod === 'chop') {
      // Chop pricing: calculate united inches and apply wholesale price
      const unitedInches = (artworkWidth + artworkHeight) * 2;
      const wholesaleCost = (unitedInches / 12) * wholesalePrice; // Convert to feet
      
      // Apply industry markup based on wholesale cost brackets
      const markup = this.getFrameMarkup(wholesaleCost);
      return wholesaleCost * markup;
    } else {
      // Join pricing: premium for seamless corners
      const unitedInches = (artworkWidth + artworkHeight) * 2;
      const wholesaleCost = (unitedInches / 12) * wholesalePrice * 1.3; // 30% premium for joins
      
      const markup = this.getFrameMarkup(wholesaleCost);
      return wholesaleCost * markup;
    }
  }

  // Get appropriate markup multiplier based on wholesale cost
  private static getFrameMarkup(wholesaleCost: number): number {
    for (const bracket of this.FRAME_MARKUP_BRACKETS) {
      if (wholesaleCost >= bracket.min && wholesaleCost <= bracket.max) {
        return bracket.markup;
      }
    }
    return 2.0; // Default markup
  }

  // Calculate mat pricing with authentic industry standards
  static calculateMatPrice(mat: MatColor, artworkWidth: number, artworkHeight: number, matWidth: number): number {
    const wholesalePrice = parseFloat(mat.price) || 0;
    
    // Calculate total mat area including borders
    const totalMatWidth = artworkWidth + (matWidth * 2);
    const totalMatHeight = artworkHeight + (matWidth * 2);
    const totalSquareInches = totalMatWidth * totalMatHeight;
    
    // Wholesale cost calculation
    const wholesaleCost = totalSquareInches * wholesalePrice;
    
    // Apply size-based markup
    const markup = this.getMatMarkup(totalSquareInches);
    return wholesaleCost * markup;
  }

  // Get mat markup based on total square inches
  private static getMatMarkup(squareInches: number): number {
    for (const bracket of this.MAT_SIZE_BRACKETS) {
      if (squareInches >= bracket.min && squareInches <= bracket.max) {
        return bracket.markup;
      }
    }
    return 2.5; // Default markup
  }

  // Calculate glass pricing with size multipliers
  static calculateGlassPrice(glassType: any, artworkWidth: number, artworkHeight: number): number {
    const basePrice = parseFloat(glassType.price) || 0;
    const squareInches = artworkWidth * artworkHeight;
    const squareFeet = squareInches / 144;
    
    // Get size multiplier
    const multiplier = this.getGlassSizeMultiplier(squareInches);
    
    // Calculate wholesale cost
    const wholesaleCost = squareFeet * basePrice;
    
    // Apply standard 3x markup for glass with size adjustment
    return wholesaleCost * 3.0 * multiplier;
  }

  // Get glass pricing multiplier based on size
  private static getGlassSizeMultiplier(squareInches: number): number {
    for (const bracket of this.GLASS_SIZE_BRACKETS) {
      if (squareInches >= bracket.min && squareInches <= bracket.max) {
        return bracket.multiplier;
      }
    }
    return 1.0; // Default multiplier
  }

  // Calculate total order pricing
  static calculateOrderTotal(
    frames: { frame: Frame; position: number; pricingMethod: string }[],
    mats: { matboard: MatColor; position: number; width: number }[],
    glassOption: any,
    artworkWidth: number,
    artworkHeight: number,
    specialServices: any[] = [],
    miscCharges: any[] = []
  ): { 
    frameTotal: number; 
    matTotal: number; 
    glassTotal: number; 
    servicesTotal: number; 
    miscTotal: number; 
    subtotal: number; 
    tax: number; 
    total: number;
    breakdown: any;
  } {
    
    // Calculate frame costs
    const frameTotal = frames.reduce((total, frameItem) => {
      return total + this.calculateFramePrice(frameItem.frame, artworkWidth, artworkHeight, frameItem.pricingMethod);
    }, 0);

    // Calculate mat costs
    const matTotal = mats.reduce((total, matItem) => {
      return total + this.calculateMatPrice(matItem.matboard, artworkWidth, artworkHeight, matItem.width);
    }, 0);

    // Calculate glass cost
    const glassTotal = glassOption ? this.calculateGlassPrice(glassOption, artworkWidth, artworkHeight) : 0;

    // Calculate special services
    const servicesTotal = specialServices.reduce((total, service) => {
      return total + (parseFloat(service.price) || 0);
    }, 0);

    // Calculate miscellaneous charges
    const miscTotal = miscCharges.reduce((total, charge) => {
      if (charge.type === 'percentage') {
        const baseAmount = frameTotal + matTotal + glassTotal + servicesTotal;
        return total + (baseAmount * (charge.amount / 100));
      }
      return total + charge.amount;
    }, 0);

    const subtotal = frameTotal + matTotal + glassTotal + servicesTotal + miscTotal;
    const taxRate = 0.0875; // 8.75% standard sales tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
      frameTotal,
      matTotal,
      glassTotal,
      servicesTotal,
      miscTotal,
      subtotal,
      tax,
      total,
      breakdown: {
        frames: frames.map(f => ({
          name: f.frame.name,
          cost: this.calculateFramePrice(f.frame, artworkWidth, artworkHeight, f.pricingMethod),
          method: f.pricingMethod
        })),
        mats: mats.map(m => ({
          name: m.matboard.name,
          cost: this.calculateMatPrice(m.matboard, artworkWidth, artworkHeight, m.width),
          width: m.width
        })),
        glass: glassOption ? {
          name: glassOption.name,
          cost: glassTotal
        } : null
      }
    };
  }

  // Calculate wholesale order requirements
  static calculateWholesaleOrder(
    frames: { frame: Frame; position: number; pricingMethod: string }[],
    mats: { matboard: MatColor; position: number; width: number }[],
    artworkWidth: number,
    artworkHeight: number
  ): {
    frameOrders: any[];
    matOrders: any[];
    totalWholesaleCost: number;
  } {
    
    const frameOrders = frames.map(frameItem => {
      const unitedInches = (artworkWidth + artworkHeight) * 2;
      const feetNeeded = Math.ceil(unitedInches / 12);
      const wholesaleCost = feetNeeded * parseFloat(frameItem.frame.price);
      
      return {
        manufacturer: frameItem.frame.manufacturer,
        sku: frameItem.frame.id,
        name: frameItem.frame.name,
        feetNeeded,
        wholesaleCost,
        pricingMethod: frameItem.pricingMethod
      };
    });

    const matOrders = mats.map(matItem => {
      const totalMatWidth = artworkWidth + (matItem.width * 2);
      const totalMatHeight = artworkHeight + (matItem.width * 2);
      const squareInchesNeeded = totalMatWidth * totalMatHeight;
      const wholesaleCost = squareInchesNeeded * parseFloat(matItem.matboard.price);
      
      return {
        manufacturer: matItem.matboard.manufacturer,
        sku: matItem.matboard.id,
        name: matItem.matboard.name,
        squareInchesNeeded,
        wholesaleCost
      };
    });

    const totalWholesaleCost = [
      ...frameOrders.map(f => f.wholesaleCost),
      ...matOrders.map(m => m.wholesaleCost)
    ].reduce((sum, cost) => sum + cost, 0);

    return {
      frameOrders,
      matOrders,
      totalWholesaleCost
    };
  }

  // Format currency for display
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Calculate profit margin
  static calculateProfitMargin(retailPrice: number, wholesaleCost: number): number {
    if (wholesaleCost === 0) return 0;
    return ((retailPrice - wholesaleCost) / retailPrice) * 100;
  }
}