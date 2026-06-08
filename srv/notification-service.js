const cds = require('@sap/cds')

// srv/notification-service.js
module.exports = class NotificationService extends cds.ApplicationService {

  async init() {

    // Subscribing to an event emitted by another service
    const OrderService = await cds.connect.to('OrderService');

    // Listen for OrderCanceled events
    OrderService.on('OrderCanceled', async (msg) => {
      const { orderID, reason } = msg.data;
      console.log(`[Notification] Order ${orderID} was canceled. Reason: ${reason}`);
      // Sending notifications, writing logs, etc.
    });

    return super.init();
  }
}