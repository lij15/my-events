using { db } from '../db/schema';

service OrderService {

  entity Orders as projection on db.Orders;

  // Declare an event and define the payload structure.
  event OrderCanceled {
    orderID  : UUID;
    reason   : String;
  }

  // Use this action to trigger emit
  action cancelOrder(orderID : UUID, reason : String) returns String;
  
  // event OrderPlaced {
  //   orderID    : UUID;
  //   customerID : String(50);
  //   amount     : Decimal(10,2);
  // }
}