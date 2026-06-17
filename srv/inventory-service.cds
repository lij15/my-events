using { my.events as db } from '../db/schema_event';

service InventoryService {

    entity Books as projection on db.Books;

    // Declare the external event sources to subscribe to
    // Format: {ServiceName}/{eventName}
    event EventService.OrderPlaced {
        orderID : UUID;
        bookID  : UUID;
        amount  : Integer;
    }

}