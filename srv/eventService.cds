using { my.events as db } from '../db/schema_event';

service EventService {

    entity Orders as projection on db.Orders;

    entity Books as projection on db.Books;

    action placeOrder(bookID: UUID,amount: Integer)
        returns { orderID: UUID; message: String; };
    
    event OrderPlaced {
        orderID :   UUID;
        bookID  :   UUID;
        amount  :   Integer;
    }

}