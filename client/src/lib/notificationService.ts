// Unified Notification Service for Jay's Frames
// This service integrates with the notification system to handle global notifications

import { toast } from "@/hooks/use-toast";

// Define notification type
export interface UnifiedNotification {
  title: string;
  description: string;
  source: string;
  sourceId?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  actionable?: boolean;
  link?: string;
  smsEnabled?: boolean;
  smsRecipient?: string;
}

// Interface for window with jfNotifications
declare global {
  interface Window {
    jfNotifications: {
      init: (appId: string, options?: any) => any;
      sendNotification: (
        title: string, 
        description: string, 
        type: string, 
        options?: any
      ) => Promise<any>;
      onNotification: (handler: (notification: UnifiedNotification) => void) => () => void;
    };
  }
}

class NotificationService {
  private initialized = false;
  private appId: string = 'jays-frames-pos';
  private unsubscribe: (() => void) | null = null;

  /**
   * Initialize the notification service
   */
  init() {
    if (typeof window === 'undefined' || this.initialized) return;

    // Check if jfNotifications is available
    if (!window.jfNotifications) {
      console.warn('Unified notification system not available');
      return;
    }

    try {
      // Initialize the notification system
      window.jfNotifications.init(this.appId, {
        onConnect: () => {
          console.log('Connected to unified notification system');
        },
        onDisconnect: () => {
          console.log('Disconnected from unified notification system');
        }
      });

      // Register notification handler to display toasts for incoming notifications
      this.unsubscribe = window.jfNotifications.onNotification((notification) => {
        this.displayNotification(notification);
      });

      // Also listen for the custom event for compatibility
      window.addEventListener('jf-notification', ((event: CustomEvent) => {
        this.displayNotification(event.detail);
      }) as EventListener);

      this.initialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  /**
   * Send a notification to the unified system
   */
  async sendNotification(
    title: string,
    description: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    options: {
      sourceId?: string;
      actionable?: boolean;
      link?: string;
      smsEnabled?: boolean;
      smsRecipient?: string;
    } = {}
  ): Promise<boolean> {
    if (typeof window === 'undefined' || !window.jfNotifications) {
      console.warn('Unified notification system not available');
      return false;
    }

    try {
      const result = await window.jfNotifications.sendNotification(
        title,
        description,
        type,
        {
          sourceId: options.sourceId || '',
          actionable: options.actionable || false,
          link: options.link || '',
          smsEnabled: options.smsEnabled || false,
          smsRecipient: options.smsRecipient || ''
        }
      );
      
      return !!result;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  /**
   * Display a notification as a toast
   */
  private displayNotification(notification: UnifiedNotification) {
    // Map notification type to toast variant
    let variant: 'default' | 'destructive' = 'default';
    if (notification.type === 'error') {
      variant = 'destructive';
    }

    // Display the notification as a toast
    toast({
      title: notification.title,
      description: notification.description,
      variant: variant,
    });

    // You can add special handling for actionable notifications here
    if (notification.actionable && notification.link) {
      // Could display a special action button or trigger navigation
      console.log('Actionable notification with link:', notification.link);
    }
  }

  /**
   * Clean up any event listeners when the service is no longer needed
   */
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('jf-notification', (() => {}) as EventListener);
    }
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService();