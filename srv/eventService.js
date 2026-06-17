const cds = require('@sap/cds')

module.exports = class EventService extends cds.ApplicationService {
    async init() {
        const { Books, Orders } = this.entities

        this.on('placeOrder', async req => {
            const { bookID, amount } = req.data

            // 1. Does the verification certificate exist?
            const book = await SELECT.one.from(Books).where({ ID: bookID })
            if(!book)               return req.error(404,'book does not exist')
            if(book.stock == null)  return req.error(500, 'Inventory data anomaly')
            if(book.stock < amount) return req.error(409, `Low stock, currently: ${book.stock}`)
            
            // 2. Create order record
            const orderID = cds.utils.uuid()
            await INSERT.into(Orders).entries({
                ID      :       orderID,
                book_ID :       bookID,
                amount,
                status  :       'pending'
            })

            // 3. Publish the event (asynchronous, without waiting for subscribers to complete processing)
            // this.emit(eventName, payload)
            // Equivalent to cds.emit(eventName, payload) in the current service context
            await this.emit('OrderPlaced', {
                orderID,
                bookID,
                amount
            })

            console.log(`The [OrderService] event has been published: OrderPlaced, orderID=${orderID}`)

            return {
                orderID,
                message: `Order created successfully! <${book.title}> x ${amount}, inventory being deducted...`
            }
        })

        return super.init()
    }
}