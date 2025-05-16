
import express from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { storage } from '../storage';

const router = express.Router();

// Get customer preferences
router.get('/:customerId/preferences', async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    if (isNaN(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }
    
    // Verify the customer exists
    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Query for existing preferences
    const preferences = await db.execute(sql`
      SELECT * FROM customer_preferences
      WHERE customer_id = ${customerId}
      LIMIT 1
    `);
    
    if (preferences.length === 0) {
      return res.status(404).json({ message: 'Customer preferences not found' });
    }
    
    res.status(200).json({
      id: preferences[0].id,
      customerId: preferences[0].customer_id,
      notificationsEnabled: preferences[0].notifications_enabled || false,
      emailNotifications: preferences[0].email_notifications || false,
      smsNotifications: preferences[0].sms_notifications || false,
      specialInstructions: preferences[0].special_instructions || '',
      notes: preferences[0].notes || '',
      preferredMatType: preferences[0].preferred_mat_type || '',
      preferredGlassType: preferences[0].preferred_glass_type || '',
      preferredPickupDay: preferences[0].preferred_pickup_day || '',
      createdAt: preferences[0].created_at,
      updatedAt: preferences[0].updated_at
    });
  } catch (error) {
    console.error('Error getting customer preferences:', error);
    res.status(500).json({ message: 'Error retrieving customer preferences' });
  }
});

// Create customer preferences
router.post('/:customerId/preferences', async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    if (isNaN(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }
    
    // Verify the customer exists
    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const {
      notificationsEnabled = false,
      emailNotifications = false,
      smsNotifications = false,
      specialInstructions = '',
      notes = '',
      preferredMatType = '',
      preferredGlassType = '',
      preferredPickupDay = ''
    } = req.body;
    
    // Check if preferences already exist
    const existingPreferences = await db.execute(sql`
      SELECT id FROM customer_preferences
      WHERE customer_id = ${customerId}
      LIMIT 1
    `);
    
    if (existingPreferences.length > 0) {
      return res.status(400).json({ message: 'Customer preferences already exist. Use PATCH to update.' });
    }
    
    // Create new preferences
    const newPreferences = await db.execute(sql`
      INSERT INTO customer_preferences (
        customer_id,
        notifications_enabled,
        email_notifications,
        sms_notifications,
        special_instructions,
        notes,
        preferred_mat_type,
        preferred_glass_type,
        preferred_pickup_day
      ) VALUES (
        ${customerId},
        ${notificationsEnabled},
        ${emailNotifications},
        ${smsNotifications},
        ${specialInstructions},
        ${notes},
        ${preferredMatType},
        ${preferredGlassType},
        ${preferredPickupDay}
      ) RETURNING *
    `);
    
    res.status(201).json({
      id: newPreferences[0].id,
      customerId: newPreferences[0].customer_id,
      notificationsEnabled: newPreferences[0].notifications_enabled,
      emailNotifications: newPreferences[0].email_notifications,
      smsNotifications: newPreferences[0].sms_notifications,
      specialInstructions: newPreferences[0].special_instructions,
      notes: newPreferences[0].notes,
      preferredMatType: newPreferences[0].preferred_mat_type,
      preferredGlassType: newPreferences[0].preferred_glass_type,
      preferredPickupDay: newPreferences[0].preferred_pickup_day,
      createdAt: newPreferences[0].created_at,
      updatedAt: newPreferences[0].updated_at
    });
  } catch (error) {
    console.error('Error creating customer preferences:', error);
    res.status(500).json({ message: 'Error creating customer preferences' });
  }
});

// Update customer preferences
router.patch('/:customerId/preferences', async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    if (isNaN(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }
    
    // Verify the customer exists
    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Check if preferences exist
    const existingPreferences = await db.execute(sql`
      SELECT id FROM customer_preferences
      WHERE customer_id = ${customerId}
      LIMIT 1
    `);
    
    if (existingPreferences.length === 0) {
      return res.status(404).json({ message: 'Customer preferences not found. Use POST to create.' });
    }
    
    const {
      notificationsEnabled,
      emailNotifications,
      smsNotifications,
      specialInstructions,
      notes,
      preferredMatType,
      preferredGlassType,
      preferredPickupDay
    } = req.body;
    
    // Build the update query dynamically based on provided fields
    let updateFields = [];
    let updateValues = [];
    
    if (notificationsEnabled !== undefined) {
      updateFields.push('notifications_enabled = ?');
      updateValues.push(notificationsEnabled);
    }
    
    if (emailNotifications !== undefined) {
      updateFields.push('email_notifications = ?');
      updateValues.push(emailNotifications);
    }
    
    if (smsNotifications !== undefined) {
      updateFields.push('sms_notifications = ?');
      updateValues.push(smsNotifications);
    }
    
    if (specialInstructions !== undefined) {
      updateFields.push('special_instructions = ?');
      updateValues.push(specialInstructions);
    }
    
    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(notes);
    }
    
    if (preferredMatType !== undefined) {
      updateFields.push('preferred_mat_type = ?');
      updateValues.push(preferredMatType);
    }
    
    if (preferredGlassType !== undefined) {
      updateFields.push('preferred_glass_type = ?');
      updateValues.push(preferredGlassType);
    }
    
    if (preferredPickupDay !== undefined) {
      updateFields.push('preferred_pickup_day = ?');
      updateValues.push(preferredPickupDay);
    }
    
    // Add updated_at field
    updateFields.push('updated_at = NOW()');
    
    if (updateFields.length === 1) {
      // If only updated_at is being updated, no real changes
      return res.status(200).json({ message: 'No changes to apply' });
    }
    
    // Execute the update query
    const updateQuery = `
      UPDATE customer_preferences
      SET ${updateFields.join(', ')}
      WHERE customer_id = ?
      RETURNING *
    `;
    
    const updatedPreferences = await db.execute(sql.raw(updateQuery, [...updateValues, customerId]));
    
    res.status(200).json({
      id: updatedPreferences[0].id,
      customerId: updatedPreferences[0].customer_id,
      notificationsEnabled: updatedPreferences[0].notifications_enabled,
      emailNotifications: updatedPreferences[0].email_notifications,
      smsNotifications: updatedPreferences[0].sms_notifications,
      specialInstructions: updatedPreferences[0].special_instructions,
      notes: updatedPreferences[0].notes,
      preferredMatType: updatedPreferences[0].preferred_mat_type,
      preferredGlassType: updatedPreferences[0].preferred_glass_type,
      preferredPickupDay: updatedPreferences[0].preferred_pickup_day,
      createdAt: updatedPreferences[0].created_at,
      updatedAt: updatedPreferences[0].updated_at
    });
  } catch (error) {
    console.error('Error updating customer preferences:', error);
    res.status(500).json({ message: 'Error updating customer preferences' });
  }
});

export default router;
