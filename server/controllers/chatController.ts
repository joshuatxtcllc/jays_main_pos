import { Request, Response } from 'express';
import { db } from '../db';
import { 
  frames, 
  larsonJuhlCatalog, 
  matColors, 
  customers, 
  orders,
  orderGroups
} from '@shared/schema';
import { like, or, and, eq } from 'drizzle-orm';
import OpenAI from 'openai';
import { findOrderByNumber } from '../services/orderService';
import { getOrderStatusHistory } from '../services/orderStatusHistoryService';
import { getLowStockAlerts } from '../services/inventoryService';

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Sample questions and answers for common queries
const FAQ_DATA = [
  {
    question: "How do I add a new order?",
    answer: "To add a new order, go to the POS System page from the main navigation menu and follow these steps:\n1. Enter customer information\n2. Add frame details and measurements\n3. Select mat, frame, and glass options\n4. Add any special services\n5. Calculate the price and submit the order"
  },
  {
    question: "How do I check inventory levels?",
    answer: "You can check inventory levels by navigating to the Inventory page. There you'll see a table of all inventory items with their current stock levels, as well as charts showing inventory trends."
  },
  {
    question: "How does the pricing calculator work?",
    answer: "The pricing calculator takes the following factors into account:\n- Frame dimensions and type\n- Mat board selections and sizes\n- Glass type\n- Special services\n- Any applicable discounts\n\nThe system automatically calculates the price based on our pricing formulas that include materials cost, labor, and markup."
  }
];

// Help topics for navigation assistance
const helpTopics = [
  {
    id: 'help-1',
    name: 'Creating a new order',
    description: 'Step-by-step guide for creating custom framing orders',
    route: '/orders/new',
    type: 'help'
  },
  {
    id: 'help-2',
    name: 'Managing inventory',
    description: 'How to track and manage your frame and material inventory',
    route: '/inventory',
    type: 'help'
  },
  {
    id: 'help-3',
    name: 'Customer management',
    description: 'Adding and managing customer information',
    route: '/customers',
    type: 'help'
  },
  {
    id: 'help-4',
    name: 'Creating payment links',
    description: 'How to generate and send payment links to customers',
    route: '/payment-links',
    type: 'help'
  },
  {
    id: 'help-5',
    name: 'Processing payments',
    description: 'How to process payments through Stripe',
    route: '/checkout',
    type: 'help'
  }
];

// Threshold for detecting order number queries
const ORDER_NUMBER_REGEX = /order\s+#?(\d+)|#(\d+)|order\s+number\s+(\d+)/i;

/**
 * Process chat messages
 */
export const processMessage = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Check if it's a specific order query first
    const orderMatch = message.match(ORDER_NUMBER_REGEX);
    if (orderMatch) {
      const orderNumber = orderMatch[1] || orderMatch[2] || orderMatch[3];
      const orderInfo = await findOrderByNumber(orderNumber);
      
      if (orderInfo) {
        const statusHistory = await getOrderStatusHistory(orderInfo.id);
        let currentStatus = orderInfo.status;
        
        if (statusHistory && Array.isArray(statusHistory) && statusHistory.length > 0) {
          currentStatus = statusHistory[0].status;
        }
          
        return res.json({
          response: `Order #${orderNumber} is currently ${currentStatus}. It was created on ${new Date(orderInfo.createdAt).toLocaleDateString()} for customer ${orderInfo.customerName}.\n\nThe order contains a ${orderInfo.frameWidth}" × ${orderInfo.frameHeight}" ${orderInfo.frameStyle} frame with ${orderInfo.matDescription || 'no mat'} and ${orderInfo.glassType} glass.\n\nThe total price is $${orderInfo.totalPrice.toFixed(2)}.`
        });
      }
    }
    
    // Check if it's an inventory query
    if (message.toLowerCase().includes('inventory') && 
       (message.toLowerCase().includes('low') || message.toLowerCase().includes('level'))) {
      const lowInventory = await getLowStockAlerts();
      
      if (lowInventory && lowInventory.length > 0) {
        const lowItems = lowInventory.map(item => `${item.name} (${item.currentStock} remaining)`).join('\n- ');
        return res.json({
          response: `Here are the items with low inventory levels:\n- ${lowItems}\n\nYou should consider reordering these items soon.`
        });
      } else {
        return res.json({
          response: "Good news! There are no items with low inventory levels at the moment."
        });
      }
    }
    
    // Check if it's a FAQ
    for (const faq of FAQ_DATA) {
      if (message.toLowerCase().includes(faq.question.toLowerCase().substring(0, 15))) {
        return res.json({ response: faq.answer });
      }
    }
    
    // If we get here, use the OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an assistant for Jay's Frames custom framing shop. Your name is Jay's Frames Assistant. You help employees navigate the POS system, check order status, and provide information about framing services. Be concise and helpful. If you don't know something, suggest where they might find the information in the system."
        },
        { role: "user", content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });
    
    const aiResponse = completion.choices[0]?.message?.content || 
      "I'm not sure how to help with that. Could you try rephrasing your question?";
    
    return res.json({ response: aiResponse });
    
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ error: 'Failed to process message. Please try again.' });
  }
};

/**
 * Searches frames by keyword
 */
async function searchFrames(keyword: string, limit: number = 5) {
  try {
    const searchResults = await db
      .select({
        id: frames.id,
        name: frames.name,
        manufacturer: frames.manufacturer,
        material: frames.material,
        catalogImage: frames.catalogImage
      })
      .from(frames)
      .where(
        or(
          like(frames.name, `%${keyword}%`),
          like(frames.manufacturer, `%${keyword}%`),
          like(frames.material, `%${keyword}%`)
        )
      )
      .limit(limit);
    
    return searchResults.map(frame => ({
      id: frame.id,
      type: 'frame',
      name: frame.name,
      description: `${frame.manufacturer || ''} ${frame.material || ''}`.trim() || 'Frame',
      route: `/frames/${frame.id}`,
      thumbnail: frame.catalogImage
    }));
  } catch (error) {
    console.error('Error searching frames:', error);
    return [];
  }
}

/**
 * Searches matboards by keyword
 */
async function searchMatboards(keyword: string, limit: number = 5) {
  try {
    const searchResults = await db
      .select({
        id: larsonJuhlCatalog.id,
        name: larsonJuhlCatalog.name,
        description: larsonJuhlCatalog.description,
        color: larsonJuhlCatalog.hex_color
      })
      .from(larsonJuhlCatalog)
      .where(
        and(
          eq(larsonJuhlCatalog.type, 'matboard'),
          or(
            like(larsonJuhlCatalog.name, `%${keyword}%`),
            like(larsonJuhlCatalog.description, `%${keyword}%`),
            like(larsonJuhlCatalog.category, `%${keyword}%`)
          )
        )
      )
      .limit(limit);
    
    return searchResults.map(matboard => ({
      id: matboard.id,
      type: 'matboard',
      name: matboard.name,
      description: matboard.description || 'Matboard',
      route: `/matboards/${matboard.id}`,
      thumbnail: null,
      color: matboard.color
    }));
  } catch (error) {
    console.error('Error searching matboards:', error);
    return [];
  }
}

/**
 * Searches customers by keyword
 */
async function searchCustomers(keyword: string, limit: number = 3) {
  try {
    const searchResults = await db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        phone: customers.phone
      })
      .from(customers)
      .where(
        or(
          like(customers.name, `%${keyword}%`),
          like(customers.email, `%${keyword}%`),
          like(customers.phone, `%${keyword}%`)
        )
      )
      .limit(limit);
    
    return searchResults.map(customer => ({
      id: `customer-${customer.id}`,
      type: 'customer',
      name: customer.name,
      description: `${customer.email || ''} ${customer.phone || ''}`.trim(),
      route: `/customers/${customer.id}`,
      thumbnail: null
    }));
  } catch (error) {
    console.error('Error searching customers:', error);
    return [];
  }
}

/**
 * Searches orders by keyword or ID
 */
async function searchOrders(keyword: string, limit: number = 3) {
  try {
    // Try to parse if this is a numeric order ID
    const orderId = parseInt(keyword);
    
    let query;
    
    if (!isNaN(orderId)) {
      // If keyword is a valid order ID, search directly by ID
      query = db
        .select({
          id: orders.id,
          customerName: customers.name,
          amount: orderGroups.subtotal,
          status: orders.status
        })
        .from(orders)
        .leftJoin(orderGroups, eq(orders.orderGroupId, orderGroups.id))
        .leftJoin(customers, eq(orders.customerId, customers.id))
        .where(eq(orders.id, orderId))
        .limit(limit);
    } else {
      // Otherwise search by customer name or status
      query = db
        .select({
          id: orders.id,
          customerName: customers.name,
          amount: orderGroups.subtotal,
          status: orders.status
        })
        .from(orders)
        .leftJoin(orderGroups, eq(orders.orderGroupId, orderGroups.id))
        .leftJoin(customers, eq(orders.customerId, customers.id))
        .where(
          or(
            like(customers.name, `%${keyword}%`),
            like(orders.status, `%${keyword}%`)
          )
        )
        .limit(limit);
    }
    
    const searchResults = await query;
    
    return searchResults.map(order => ({
      id: `order-${order.id}`,
      type: 'order',
      name: `Order #${order.id}`,
      description: `${order.customerName || 'Unknown customer'} - ${order.status || 'Unknown status'}`,
      route: `/orders/${order.id}`,
      thumbnail: null
    }));
  } catch (error) {
    console.error('Error searching orders:', error);
    return [];
  }
}

/**
 * Searches help topics by keyword
 */
function searchHelp(keyword: string, limit: number = 3) {
  if (!keyword) return [];
  
  const keywordLower = keyword.toLowerCase();
  
  const matchingHelp = helpTopics.filter(topic => 
    topic.name.toLowerCase().includes(keywordLower) || 
    topic.description.toLowerCase().includes(keywordLower)
  ).slice(0, limit);
  
  return matchingHelp;
}

/**
 * Process the chat query and generate a response
 */
async function processChatQuery(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Extract potential keywords
  const words = lowerMessage
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/)
    .filter(word => word.length > 2); // Filter out short words
  
  // Handle common greeting patterns
  if (/^(hi|hello|hey|howdy)/i.test(lowerMessage)) {
    return {
      response: "Hello! How can I help you today? You can search for frames, matboards, customers, or ask about system features.",
      searchResults: []
    };
  }
  
  // Handle help requests
  if (/how (do|can) (i|we)|help|guide|tutorial|instructions/i.test(lowerMessage)) {
    let helpResponse = "Here are some help topics that might assist you:";
    return {
      response: helpResponse,
      searchResults: searchHelp(message, 5)
    };
  }
  
  // Handle navigation requests
  if (/where|find|go to|navigate|take me/i.test(lowerMessage)) {
    if (/customer|client/i.test(lowerMessage)) {
      return {
        response: "Here's how you can manage customers:",
        searchResults: [
          {
            id: 'nav-customers',
            type: 'help',
            name: 'Customer Management',
            description: 'View and manage customer information',
            route: '/customers'
          }
        ]
      };
    }
    
    if (/order|framing/i.test(lowerMessage)) {
      return {
        response: "You can manage orders here:",
        searchResults: [
          {
            id: 'nav-orders',
            type: 'help',
            name: 'Orders',
            description: 'View and manage framing orders',
            route: '/orders'
          }
        ]
      };
    }
    
    if (/inventory|stock|material/i.test(lowerMessage)) {
      return {
        response: "You can manage inventory here:",
        searchResults: [
          {
            id: 'nav-inventory',
            type: 'help',
            name: 'Inventory Management',
            description: 'Track and manage your inventory',
            route: '/inventory'
          }
        ]
      };
    }
    
    if (/payment|checkout|pay/i.test(lowerMessage)) {
      return {
        response: "Here are payment-related pages:",
        searchResults: [
          {
            id: 'nav-payment-links',
            type: 'help',
            name: 'Payment Links',
            description: 'Create and manage payment links',
            route: '/payment-links'
          },
          {
            id: 'nav-checkout',
            type: 'help',
            name: 'Checkout',
            description: 'Process payments',
            route: '/checkout'
          }
        ]
      };
    }
  }
  
  // Default to search if no specific pattern matched
  // Combine keywords for better search results
  const searchTerm = words.join(' ');
  
  // Perform searches in parallel
  const [frames, matboards, customers, orders, helpTopics] = await Promise.all([
    searchFrames(searchTerm),
    searchMatboards(searchTerm),
    searchCustomers(searchTerm),
    searchOrders(searchTerm),
    searchHelp(searchTerm)
  ]);
  
  // Combine all results
  const allResults = [...frames, ...matboards, ...customers, ...orders, ...helpTopics];
  
  if (allResults.length === 0) {
    return {
      response: "I couldn't find anything matching your query. Could you try with different keywords? You can search for frames, matboards, customers, or orders.",
      searchResults: []
    };
  }
  
  return {
    response: `Here are some results for "${message}":`,
    searchResults: allResults
  };
}

/**
 * Handle chat messages and perform searches
 */
export async function handleChatMessage(req: Request, res: Response) {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }
    
    const response = await processChatQuery(message);
    
    res.json({
      success: true,
      response: response.response,
      searchResults: response.searchResults
    });
  } catch (error: any) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ 
      success: false, 
      error: `Failed to process message: ${error.message}` 
    });
  }
}
