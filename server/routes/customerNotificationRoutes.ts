
import express from 'express';
import * as customerNotificationService from '../services/customerNotificationService';

const router = express.Router();

// Get all notifications for a customer
router.get('/customers/:customerId/notifications', async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    
    if (isNaN(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }
    
    const notifications = await customerNotificationService.getCustomerNotifications(customerId, limit);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error getting customer notifications:', error);
    res.status(500).json({ message: 'Error retrieving customer notifications' });
  }
});

// Mark notifications as read
router.post('/notifications/mark-read', async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ message: 'Invalid notification IDs' });
    }
    
    await customerNotificationService.markNotificationsAsRead(notificationIds);
    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Error marking notifications as read' });
  }
});

export default router;
