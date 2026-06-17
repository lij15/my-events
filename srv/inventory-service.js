const cds = require('@sap/cds')

module.exports = class InventoryService extends cds.ApplicationService {
    async init() {
        const { Books } = this.entities

        // Subscribe to the OrderPlaced event from OrderService
        // Both methods are acceptable:
        // 1. this.on('OrderService.OrderPlaced', handler) — Subscribe within the current service
        // 2. Subscribe across services via MessagingService (production environment)

        const EventService = await cds.connect.to('EventService')

        EventService.on('OrderPlaced', async msg => {
            const { orderID, bookID, amount } = msg.data

            console.log(`[InventoryService] received the event OrderPlaced:`, msg.data)

            const book = await SELECT.one.from(Books).where({ ID: bookID })

            if (!book) {
                console.error(`[InventoryService] The book ${bookID} does not exist, so inventory cannot be deducted.`)
                return
            }

            if (book.stock < amount) {
                console.error(`[InventoryService] Insufficient stock. Current inventory: ${book.stock}, Required: ${amount}`)
                return
            }

            await UPDATE(Books)
                .set({ stock: book.stock - amount })
                .where({ ID: bookID })
            
            console.log(`[InventoryService] Inventory deduction successful! Remaining balance for <${book.title}>: ${book.stock - amount}`)
        })

        return super.init()
    }
}


// // Cross-process/Cross-service (Production Environment)
// // Subscribing via MessagingService, no need to know where the publisher is.
// const messaging = await cds.connect.to('messaging')
// messaging.on('OrderService/OrderPlaced', async msg => { ... })
// // Released via messaging
// await messaging.emit('OrderService/OrderPlaced', { ... })