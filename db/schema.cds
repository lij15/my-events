namespace db;

entity Orders {
  key ID     : UUID;
  amount     : Decimal(10,2);
  status     : String(20);
  customerID : String(50);
}