// Jay's Frames Unified Notification System
(function() {
  // Define utility functions
  const jfNotifications = {
    appId: null,
    websocket: null,
    connected: false,
    
    // Initialize the connection
    init: function(appId, options = {}) {
      this.appId = appId;
      
      // Setup WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const dashboardUrl = options.dashboardUrl || 'https://jaysframes-dashboard.replit.app';
      
      // Extract the hostname and port from the URL
      let wsUrl;
      try {
        const url = new URL(dashboardUrl);
        wsUrl = protocol + '//' + url.hostname + '/ws';
      } catch (e) {
        wsUrl = protocol + '//' + dashboardUrl + '/ws';
      }
      
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('[JF Notifications] Connected to ' + wsUrl);
        this.connected = true;
        
        // Register this app with the notification system
        this.sendMessage({
          type: 'register',
          appId: this.appId
        });
        
        // Setup ping to keep connection alive
        this.pingInterval = setInterval(() => {
          if (this.websocket && this.websocket.readyState === 1) { // OPEN
            this.sendMessage({ type: 'ping' });
          }
        }, 30000);
        
        if (options.onConnect) options.onConnect();
      };
      
      this.websocket.onclose = () => {
        console.log('[JF Notifications] Connection closed');
        this.connected = false;
        
        // Clean up ping interval
        if (this.pingInterval) {
          clearInterval(this.pingInterval);
        }
        
        // Setup reconnection
        setTimeout(() => {
          console.log('[JF Notifications] Attempting to reconnect...');
          this.init(this.appId, options);
        }, 5000);
        
        if (options.onDisconnect) options.onDisconnect();
      };
      
      this.websocket.onerror = (error) => {
        console.error('[JF Notifications] WebSocket error:', error);
      };
      
      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle received notifications
          if (data.type === 'notification' || 
              (data.type === 'event' && data.event === 'new_notification')) {
            
            const notification = data.payload;
            if (notification) {
              // Dispatch custom event that apps can listen for
              const notificationEvent = new CustomEvent('jf-notification', { 
                detail: notification 
              });
              window.dispatchEvent(notificationEvent);
              
              // Call any registered handlers
              if (this.handlers.length > 0) {
                this.handlers.forEach(handler => handler(notification));
              }
            }
          }
        } catch (error) {
          console.error('[JF Notifications] Error processing message:', error);
        }
      };
      
      return this;
    },
    
    // Send a message to the WebSocket
    sendMessage: function(message) {
      if (this.websocket && this.websocket.readyState === 1) { // OPEN
        this.websocket.send(JSON.stringify(message));
        return true;
      }
      return false;
    },
    
    // Send a notification to the unified system
    sendNotification: async function(title, description, type, options = {}) {
      if (!this.appId) {
        console.error('[JF Notifications] App not initialized. Call init first.');
        return null;
      }
      
      // Types: info, success, warning, error
      const validTypes = ['info', 'success', 'warning', 'error'];
      const notificationType = validTypes.includes(type) ? type : 'info';
      
      // Try WebSocket first
      const sent = this.sendMessage({
        type: 'event',
        event: 'new_notification',
        source: this.appId,
        payload: {
          title,
          description,
          source: this.appId,
          sourceId: options.sourceId || '',
          type: notificationType,
          actionable: options.actionable || false,
          link: options.link || '',
          smsEnabled: options.smsEnabled || false,
          smsRecipient: options.smsRecipient || ''
        }
      });
      
      // Fall back to API if WebSocket is not available
      if (!sent) {
        try {
          const apiUrl = '/api/notifications';
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title,
              description,
              source: this.appId,
              sourceId: options.sourceId || '',
              type: notificationType,
              actionable: options.actionable || false,
              link: options.link || '',
              smsEnabled: options.smsEnabled || false,
              smsRecipient: options.smsRecipient || ''
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            return data.notification;
          }
        } catch (error) {
          console.error('[JF Notifications] Error sending notification:', error);
        }
      }
      
      return sent;
    },
    
    // Handler functions for notifications
    handlers: [],
    
    // Register a handler for notifications
    onNotification: function(handler) {
      if (typeof handler === 'function') {
        this.handlers.push(handler);
        
        // Return a function to unregister this handler
        return () => {
          this.handlers = this.handlers.filter(h => h !== handler);
        };
      }
    }
  };
  
  // Make available globally
  window.jfNotifications = jfNotifications;
})();