const cds = require('@sap/cds')

// srv/order-service.js
module.exports = class OrderService extends cds.ApplicationService {

  async init() {

    const { Orders } = this.entities;

    this.on('cancelOrder', async (req) => {
      const { orderID, reason } = req.data;

      // Business logic: Update order status
      await UPDATE(Orders)
        .set({ status: 'CANCELED' })
        .where({ ID: orderID });

      // emit event, publish to the message channel
      await this.emit('OrderCanceled', {
        orderID,
        reason
      });

      return `Order ${orderID} canceled`;
    });

    // 2. event subscriber — Subscribe within the same service and verify receipt.
    this.on('OrderCanceled', (msg) => {
      console.log('[event] OrderCanceled received:');
      console.log('  orderID :', msg.data.orderID);
      console.log('  reason  :', msg.data.reason);
    });

    return super.init();
  }
}