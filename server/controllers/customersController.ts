
import { Request, Response } from 'express';
import { db } from '../db';
import { customers, insertCustomerSchema } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

// Get all customers
export async function getAllCustomers(req: Request, res: Response) {
  try {
    const allCustomers = await db
      .select()
      .from(customers)
      .orderBy(desc(customers.createdAt));

    return res.status(200).json(allCustomers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({ message: 'Error fetching customers' });
  }
}

// Get customer by ID
export async function getCustomerById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const customerId = parseInt(id);

    if (isNaN(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }

    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (customer.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    return res.status(200).json(customer[0]);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return res.status(500).json({ message: 'Error fetching customer' });
  }
}

// Create new customer
export async function createCustomer(req: Request, res: Response) {
  try {
    const validatedData = insertCustomerSchema.parse(req.body);
    
    const [newCustomer] = await db
      .insert(customers)
      .values(validatedData)
      .returning();

    return res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid customer data', errors: error.errors });
    }
    return res.status(500).json({ message: 'Error creating customer' });
  }
}
