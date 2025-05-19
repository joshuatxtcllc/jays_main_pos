import { Request, Response } from 'express';
import { storage } from '../storage';
import ws from 'ws';

// Define notification type
export interface Notification {
  id?: number;
  title: string;
  description: string;
  source: string;
  sourceId?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  actionable: boolean;
  link?: string;
  createdAt?: Date;
  read?: boolean;
  smsEnabled?: boolean;
  smsRecipient?: string;
}

// Keep a list of connected WebSocket clients
interface ConnectedClient {
  appId: string;
  socket: ws;
}

class NotificationController {
  private connectedClients: ConnectedClient[] = [];

  constructor() {
    // Initialize WebSocket connections in the WebSocket server setup function
  }

  // Add a client to the connected clients list
  addClient(appId: string, socket: ws) {
    this.connectedClients.push({ appId, socket });
    console.log(`[Notifications] Client ${appId} connected. Total clients: ${this.connectedClients.length}`);
  }

  // Remove a client from the connected clients list
  removeClient(socket: ws) {
    const clientIndex = this.connectedClients.findIndex(client => client.socket === socket);
    
    if (clientIndex !== -1) {
      const { appId } = this.connectedClients[clientIndex];
      this.connectedClients.splice(clientIndex, 1);
      console.log(`[Notifications] Client ${appId} disconnected. Total clients: ${this.connectedClients.length}`);
    }
  }

  // Send a notification to all connected clients or specific apps
  sendNotification(notification: Notification, targetApps?: string[]) {
    const notificationEvent = {
      type: 'event',
      event: 'new_notification',
      payload: notification
    };

    // Store the notification in the database
    this.storeNotification(notification);

    // Send SMS if enabled
    if (notification.smsEnabled && notification.smsRecipient) {
      this.sendSmsNotification(notification);
    }

    // Send to all relevant WebSocket clients
    this.connectedClients.forEach(client => {
      // Send to specific target apps or all if no targets specified
      if (!targetApps || targetApps.includes(client.appId)) {
        if (client.socket.readyState === ws.OPEN) {
          client.socket.send(JSON.stringify(notificationEvent));
        }
      }
    });

    return notification;
  }

  // API endpoint to create a new notification
  async createNotification(req: Request, res: Response) {
    try {
      const notification: Notification = req.body;

      // Validate required fields
      if (!notification.title || !notification.description || !notification.source || !notification.type) {
        return res.status(400).json({ error: 'Missing required notification fields' });
      }

      // Make sure type is valid
      const validTypes = ['info', 'success', 'warning', 'error'];
      if (!validTypes.includes(notification.type)) {
        notification.type = 'info'; // Default to info if invalid
      }

      // Store and send the notification
      const sentNotification = this.sendNotification(notification);

      return res.status(201).json({ 
        success: true, 
        notification: sentNotification 
      });
    } catch (error) {
      console.error('[Notifications] Error creating notification:', error);
      return res.status(500).json({ error: 'Failed to create notification' });
    }
  }

  // Store a notification in the database
  private async storeNotification(notification: Notification) {
    try {
      // Store in DB if storage method is available
      if (storage.createNotification) {
        await storage.createNotification(notification);
      } else {
        console.log('[Notifications] No storage.createNotification method available');
      }
    } catch (error) {
      console.error('[Notifications] Error storing notification:', error);
    }
  }

  // Send an SMS notification
  private async sendSmsNotification(notification: Notification) {
    try {
      // This would use Twilio or another SMS provider
      // This method is a stub - implement actual SMS sending when needed
      console.log(`[Notifications] SMS would be sent to ${notification.smsRecipient}: ${notification.title}`);
    } catch (error) {
      console.error('[Notifications] Error sending SMS notification:', error);
    }
  }
}

// Create and export a singleton instance
export const notificationController = new NotificationController();