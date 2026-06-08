# my-events

A hands-on practice project for **SAP CAP (Cloud Application Programming Model)**, focused on **Custom-Defined Events** — how to declare, emit, and subscribe to events across services.

---

## Overview

This project demonstrates the full lifecycle of CAP events:

- Declaring events in a service using CDS
- Emitting events from an action handler via `this.emit()`
- Subscribing to events within the same service
- Subscribing to events from another service via `cds.connect.to()`
- Understanding why `.cds` files are required for every service

---

## Project Structure

```
my-events/
├── app/                          # UI frontend (if any)
├── db/
│   └── schema.cds                # Domain models
├── srv/
│   ├── order-service.cds         # OrderService definition + event declaration
│   ├── order-service.js          # OrderService handler — emits events
│   ├── notification-service.cds  # NotificationService definition (required!)
│   └── notification-service.js   # NotificationService handler — subscribes to events
├── test/
│   └── http/                     # .http files for manual API testing
├── package.json
└── readme.md
```

---

## Key Concepts

### 1. Declare an Event in CDS

```cds
// srv/order-service.cds
service OrderService {

  event OrderCanceled {
    orderID : UUID;
    reason  : String;
  }

  action cancelOrder(orderID : UUID, reason : String) returns String;
}
```

Events are **not HTTP endpoints** — they are payload type declarations for messaging channels.  
You cannot call them directly with GET or POST.

---

### 2. Emit an Event from an Action Handler

```js
// srv/order-service.js
module.exports = class OrderService extends cds.ApplicationService {
  async init() {

    this.on('cancelOrder', async (req) => {
      const { orderID, reason } = req.data;

      // Emit the event — this is what triggers subscribers
      await this.emit('OrderCanceled', { orderID, reason });

      return `Order ${orderID} canceled`;
    });

    return super.init();
  }
}
```

---

### 3. Subscribe within the Same Service

```js
this.on('OrderCanceled', (msg) => {
  console.log('[self] OrderCanceled received:', msg.data);
});
```

---

### 4. Subscribe from Another Service

```js
// srv/notification-service.js
module.exports = class NotificationService extends cds.ApplicationService {
  async init() {

    const OrderService = await cds.connect.to('OrderService');

    OrderService.on('OrderCanceled', async (msg) => {
      const { orderID, reason } = msg.data;
      console.log(`[Notification] Order ${orderID} was canceled. Reason: ${reason}`);
    });

    return super.init();
  }
}
```

> **Important:** `notification-service.cds` must exist (even if empty) for CAP to load `notification-service.js`.  
> CAP scans `srv/*.cds` as entry points — `.js` files without a matching `.cds` are silently ignored.

```cds
// srv/notification-service.cds
service NotificationService {}
```

---

## How to Trigger

Events cannot be triggered directly. The flow is:

```
POST /odata/v4/order/cancelOrder   ← your HTTP request
    → order-service.js handler runs
        → this.emit('OrderCanceled', data)
            → notification-service.js subscriber fires
                → console.log(...)
```

---

## Getting Started

```bash
npm install
cds watch
```

Service runs at: `http://localhost:4004`

Expected startup output:

```
[cds] - serving OrderService        { at: '/odata/v4/order' }
[cds] - serving NotificationService { at: '/odata/v4/notification' }
```

If `NotificationService` is missing from the output, check that `notification-service.cds` exists.

---

## Testing

Use the `.http` files in `test/http/` with the VS Code [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension.

```http
### Trigger cancelOrder → emits OrderCanceled → NotificationService receives it
POST http://localhost:4004/odata/v4/order/cancelOrder
Content-Type: application/json
Authorization: Basic alice:

{
  "orderID": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "reason": "customer request"
}
```

Expected console output:

```
[Notification] Order f47ac10b-58cc-4372-a567-0e02b2c3d479 was canceled. Reason: customer request
```

---

## Event vs Action — Quick Reference

| | Action / Function | Event |
|---|---|---|
| **Direction** | Request → Response (sync) | Service → Subscriber (async) |
| **Triggered by** | HTTP call from client | `this.emit()` inside a handler |
| **Consumed by** | Caller gets a return value | Any service that subscribes |
| **Transport** | HTTP / OData | Messaging channel (in-process locally) |
| **Has return value** | Yes | No |

---

## Common Pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| `notification-service.js` not loaded | No matching `.cds` file | Create `notification-service.cds` |
| Subscriber never fires | Forgot to call `this.emit()` | Add `await this.emit(...)` in the action handler |
| `super.init()` missing | Handler registration skipped | Always call `return super.init()` last |

---

## References

- [SAP CAP Documentation](https://cap.cloud.sap/docs)
- [CDS Language Reference — Events](https://cap.cloud.sap/docs/cds/cdl#events)
- [CAP Node.js — Emitting Events](https://cap.cloud.sap/docs/node.js/core-services#srv-emit-event)
- [CAP Messaging Guide](https://cap.cloud.sap/docs/guides/messaging/)
