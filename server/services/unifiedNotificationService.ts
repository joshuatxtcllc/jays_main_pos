import DiscordBot from './discordBot.js';
import { notificationController } from '../controllers/notificationController.js';
import { createCustomerNotification } from './customerNotificationService.js';

interface NotificationChannel {
  email?: boolean;
  sms?: boolean;
  discord?: boolean;
  inApp?: boolean;
}

interface CustomerContact {
  id: number;
  email?: string;
  phone?: string;
  discordUserId?: string;
  preferences?: NotificationChannel;
}

interface NotificationData {
  title: string;
  message: string;
  orderId?: number;
  type: 'order_update' | 'completion_notice' | 'estimate_update' | 'custom' | 'production_alert';
  urgency: 'low' | 'normal' | 'high';
}

class UnifiedNotificationService {
  private discordBot: DiscordBot;

  constructor(discordBot: DiscordBot) {
    this.discordBot = discordBot;
  }

  /**
   * Send notification to customer through all enabled channels
   */
  async notifyCustomer(customer: CustomerContact, notification: NotificationData): Promise<{
    discord: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  }> {
    const results = {
      discord: false,
      email: false,
      sms: false,
      inApp: false
    };

    const channels = customer.preferences || { email: true, inApp: true };

    try {
      // Discord DM
      if (channels.discord && customer.discordUserId) {
        results.discord = await this.sendDiscordNotification(
          customer.discordUserId, 
          notification
        );
      }

      // Email notification
      if (channels.email && customer.email) {
        results.email = await this.sendEmailNotification(customer, notification);
      }

      // SMS notification
      if (channels.sms && customer.phone) {
        results.sms = await this.sendSmsNotification(customer, notification);
      }

      // In-app notification
      if (channels.inApp) {
        results.inApp = await this.sendInAppNotification(customer, notification);
      }

      // Store notification in database
      if (notification.orderId) {
        await createCustomerNotification(
          customer.id,
          notification.orderId,
          notification.type,
          notification.message
        );
      }

    } catch (error) {
      console.error('Error in unified notification service:', error);
    }

    return results;
  }

  /**
   * Send Discord notification based on type
   */
  private async sendDiscordNotification(userId: string, notification: NotificationData): Promise<boolean> {
    try {
      switch (notification.type) {
        case 'order_update':
          return await this.discordBot.sendOrderStatusDM(
            userId, 
            notification.orderId?.toString() || 'Unknown',
            notification.title,
            notification.message
          );
        
        case 'completion_notice':
          return await this.discordBot.sendCompletionNoticeDM(
            userId,
            notification.orderId?.toString() || 'Unknown',
            notification.message
          );
        
        case 'estimate_update':
          const days = this.extractDaysFromMessage(notification.message);
          return await this.discordBot.sendEstimateUpdateDM(
            userId,
            notification.orderId?.toString() || 'Unknown',
            days
          );
        
        default:
          return await this.discordBot.sendCustomNotificationDM(
            userId,
            notification.title,
            notification.message
          );
      }
    } catch (error) {
      console.error('Discord notification failed:', error);
      return false;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(customer: CustomerContact, notification: NotificationData): Promise<boolean> {
    try {
      // This would integrate with your email service (SendGrid, etc.)
      console.log(`[Email] Sending to ${customer.email}: ${notification.title}`);
      
      // Use existing notification controller for email
      notificationController.sendNotification({
        id: Date.now().toString(),
        title: notification.title,
        description: notification.message,
        type: notification.urgency === 'high' ? 'error' : 'info',
        sourceId: `customer-${customer.id}`,
        timestamp: new Date(),
        actionable: notification.type === 'completion_notice',
        link: notification.orderId ? `/orders/${notification.orderId}` : undefined,
        smsEnabled: false,
        smsRecipient: customer.phone
      });

      return true;
    } catch (error) {
      console.error('Email notification failed:', error);
      return false;
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSmsNotification(customer: CustomerContact, notification: NotificationData): Promise<boolean> {
    try {
      // This would integrate with Twilio
      console.log(`[SMS] Sending to ${customer.phone}: ${notification.title}`);
      
      // Use existing notification controller for SMS
      notificationController.sendNotification({
        id: Date.now().toString(),
        title: notification.title,
        description: notification.message,
        type: 'info',
        sourceId: `customer-${customer.id}`,
        timestamp: new Date(),
        actionable: false,
        smsEnabled: true,
        smsRecipient: customer.phone
      });

      return true;
    } catch (error) {
      console.error('SMS notification failed:', error);
      return false;
    }
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(customer: CustomerContact, notification: NotificationData): Promise<boolean> {
    try {
      notificationController.sendNotification({
        id: Date.now().toString(),
        title: notification.title,
        description: notification.message,
        type: notification.urgency === 'high' ? 'error' : 'info',
        sourceId: `customer-${customer.id}`,
        timestamp: new Date(),
        actionable: notification.type === 'completion_notice',
        link: notification.orderId ? `/orders/${notification.orderId}` : undefined,
        smsEnabled: false
      }, [`customer-app-${customer.id}`]);

      return true;
    } catch (error) {
      console.error('In-app notification failed:', error);
      return false;
    }
  }

  /**
   * Extract days from estimate message
   */
  private extractDaysFromMessage(message: string): number {
    const match = message.match(/(\d+)\s*days?/i);
    return match ? parseInt(match[1]) : 7; // Default to 7 days
  }

  /**
   * Send order status update to customer
   */
  async sendOrderStatusUpdate(
    customer: CustomerContact, 
    orderId: number, 
    status: string, 
    details?: string
  ): Promise<void> {
    await this.notifyCustomer(customer, {
      title: `Order #${orderId} Status Update`,
      message: `Your order status has been updated to: ${status}${details ? `. ${details}` : ''}`,
      orderId,
      type: 'order_update',
      urgency: 'normal'
    });
  }

  /**
   * Send completion notice to customer
   */
  async sendCompletionNotice(
    customer: CustomerContact, 
    orderId: number, 
    pickupInfo?: string
  ): Promise<void> {
    await this.notifyCustomer(customer, {
      title: `Order #${orderId} Complete!`,
      message: `Your custom frame is ready for pickup!${pickupInfo ? ` ${pickupInfo}` : ''}`,
      orderId,
      type: 'completion_notice',
      urgency: 'high'
    });
  }

  /**
   * Send estimate update to customer
   */
  async sendEstimateUpdate(
    customer: CustomerContact, 
    orderId: number, 
    estimatedDays: number
  ): Promise<void> {
    await this.notifyCustomer(customer, {
      title: `Order #${orderId} Timeline Update`,
      message: `Your order is now estimated to complete in ${estimatedDays} days.`,
      orderId,
      type: 'estimate_update',
      urgency: 'normal'
    });
  }
}

export default UnifiedNotificationService;
export type { CustomerContact, NotificationData, NotificationChannel };