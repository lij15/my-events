namespace my.events;
using { cuid, managed } from '@sap/cds/common';

entity Books : cuid, managed {
    title       :       String(200);
    price       :       Decimal(9,2);
    stock       :       Integer default 0;
}

entity Orders : cuid,managed {
    book        :       Association to Books;
    amount      :       Integer;
    status      :       String(20) default 'pending';
}
