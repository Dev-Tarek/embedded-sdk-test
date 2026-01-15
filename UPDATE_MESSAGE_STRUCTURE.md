# Task: Update Test App Message Structure to Match New Unified Format

## Context
The merchant dashboard repository (`ui-merchant-embedded`) has been updated to use a unified BaseMessage structure. This test app MUST be updated to match the new structure, otherwise communication with the merchant dashboard will fail.

## Critical Change: Unified BaseMessage Structure

### New Structure (REQUIRED)
All messages MUST follow this structure:

```typescript
interface BaseMessage {
  event: string;                    // Event identifier
  payload: Record<string, unknown>;  // ALL event-specific data goes here
  timestamp: number;                 // Unix timestamp in milliseconds
  source: "embedded-app" | "merchant-dashboard";
  requestId?: string;
  // Optional metadata (at root level):
  metadata?: {
    version: string;
    [key: string]: unknown;
  };
}
```

### Current Structure (INCORRECT - NEEDS UPDATE)
The test app currently has event definitions like this:

```javascript
// ❌ CURRENT - Properties mixed in payload with event
"embedded::iframe.ready": {
  payload: {
    event: "embedded::iframe.ready",  // ❌ event should be at root
    height: 600,                       // ✅ This is correct (in payload)
  },
}
```

### Required Structure (CORRECT)
```javascript
// ✅ CORRECT - Event at root, data in payload, timestamp and source added
{
  event: "embedded::iframe.ready",
  payload: {
    height: 600
  },
  timestamp: Date.now(),
  source: "embedded-app"
}
```

## Files to Update

### 1. `src/utils/eventDefinitions.js` - PRIMARY UPDATE
This file defines all event payloads. Each event definition needs to be restructured:

**Current Pattern:**
```javascript
"embedded::iframe.ready": {
  category: "iframe",
  description: "...",
  payload: {
    event: "embedded::iframe.ready",  // ❌ Remove this
    height: 600,                       // ✅ Keep in payload
  },
}
```

**New Pattern:**
```javascript
"embedded::iframe.ready": {
  category: "iframe",
  description: "...",
  payload: {
    height: 600,  // ✅ Only data, no event property
  },
}
```

Then when sending, wrap it properly:
```javascript
const message = {
  event: "embedded::iframe.ready",
  payload: eventDef.payload,
  timestamp: Date.now(),
  source: "embedded-app"
};
```

### 2. `src/components/EventTriggers.jsx` - Message Sending
Update the `sendSdkEvent` function to wrap payloads correctly.

### 3. `src/hooks/useEmbeddedSDK.js` - Message Receiving
Update any message parsing to read from `message.payload.*` instead of root level.

### 4. `src/components/MessageLog.jsx` - Message Display
Update message display to show the new structure.

## Event-by-Event Update Guide

### Iframe Lifecycle Events

#### `embedded::iframe.ready`
**Current:**
```javascript
payload: {
  event: "embedded::iframe.ready",
  height: 600,
}
```

**Update to:**
```javascript
payload: {
  height: 600,  // Remove event property
}
```

**When sending:**
```javascript
window.parent.postMessage({
  event: "embedded::iframe.ready",
  payload: { height: 600 },
  timestamp: Date.now(),
  source: "embedded-app"
}, origin);
```

#### `embedded::ready`
**Current:**
```javascript
payload: {
  event: "embedded::ready",
}
```

**Update to:**
```javascript
payload: {}  // Empty payload
```

**When sending:**
```javascript
window.parent.postMessage({
  event: "embedded::ready",
  payload: {},
  timestamp: Date.now(),
  source: "embedded-app"
}, origin);
```

#### `embedded::iframe.resize`
**Current:**
```javascript
payload: {
  event: "embedded::iframe.resize",
  height: 800,
}
```

**Update to:**
```javascript
payload: {
  height: 800,
}
```

#### `embedded::destroy`
**Current:**
```javascript
payload: {
  event: "embedded::destroy",
}
```

**Update to:**
```javascript
payload: {}  // Empty payload
```

### Authentication Events

#### `embedded::auth.refresh`
**Current:**
```javascript
payload: {
  event: "embedded::auth.refresh",
}
```

**Update to:**
```javascript
payload: {}  // Empty payload
```

### Page Navigation Events

#### `embedded::page.navigate`
**Current:**
```javascript
payload: {
  event: "embedded::page.navigate",
  path: "/products",
  state: {},
  replace: false,
}
```

**Update to:**
```javascript
payload: {
  path: "/products",
  state: {},
  replace: false,
}
```

#### `embedded::page.redirect`
**Current:**
```javascript
payload: {
  event: "embedded::page.redirect",
  url: "https://salla.sa",
}
```

**Update to:**
```javascript
payload: {
  url: "https://salla.sa",
}
```

#### `embedded::page.setTitle`
**Current:**
```javascript
payload: {
  event: "embedded::page.setTitle",
  title: "My App - Product Details",
}
```

**Update to:**
```javascript
payload: {
  title: "My App - Product Details",
}
```

### Navigation Bar Events

#### `embedded::nav.setAction`
**Current:**
```javascript
payload: {
  event: "embedded::nav.setAction",
  title: "Add Product",
  onClick: true,
  value: "create",
  subTitle: "Create a new product",
  icon: "sicon-add",
  disabled: false,
  extendedActions: [...],
}
```

**Update to:**
```javascript
payload: {
  title: "Add Product",
  onClick: true,
  value: "create",
  subTitle: "Create a new product",
  icon: "sicon-add",
  disabled: false,
  extendedActions: [...],
}
```

### UI Events

#### `embedded::ui.loading`
**Current:**
```javascript
payload: {
  event: "embedded::ui.loading",
  status: false,
  mode: "full",
}
```

**Update to:**
```javascript
payload: {
  action: "show",  // or "hide"
}
```

**Note:** The `status` and `mode` fields have been replaced with a single `action` field:
- `action: "show"` - Show loading indicator
- `action: "hide"` - Hide loading indicator

#### `embedded::ui.toast`
**Current:**
```javascript
payload: {
  event: "embedded::ui.toast",
  type: "success",
  message: "Operation completed successfully!",
  duration: 3000,
}
```

**Update to:**
```javascript
payload: {
  type: "success",
  message: "Operation completed successfully!",
  duration: 3000,
}
```

#### `embedded::ui.modal`
**Current:**
```javascript
payload: {
  event: "embedded::ui.modal",
  action: "open",
  id: "confirm-dialog",
  content: {...},
}
```

**Update to:**
```javascript
payload: {
  action: "open",
  id: "confirm-dialog",
  content: {...},
}
```

#### `embedded::ui.confirm`
**Current:**
```javascript
payload: {
  event: "embedded::ui.confirm",
  title: "Delete Product?",
  message: "...",
  confirmText: "Delete",
  cancelText: "Cancel",
  variant: "danger",
}
```

**Update to:**
```javascript
payload: {
  title: "Delete Product?",
  message: "...",
  confirmText: "Delete",
  cancelText: "Cancel",
  variant: "danger",
}
// Note: requestId should be generated and added at root level when sending
```

**When sending:**
```javascript
const requestId = `req-${Date.now()}`;
window.parent.postMessage({
  event: "embedded::ui.confirm",
  payload: {
    title: "Delete Product?",
    message: "...",
    confirmText: "Delete",
    cancelText: "Cancel",
    variant: "danger",
  },
  requestId: requestId,  // At root level
  timestamp: Date.now(),
  source: "embedded-app"
}, origin);
```

### Checkout Events

#### `embedded::checkout.create`
**Current:**
```javascript
payload: {
  event: "embedded::checkout.create",
  payload: {  // ❌ Nested payload - incorrect
    checkoutId: "...",
    amount: 299.99,
    currency: "SAR",
    items: [...],
  },
}
```

**Update to:**
```javascript
payload: {
  checkoutId: "...",
  amount: 299.99,
  currency: "SAR",
  items: [...],
}
```

**Note:** Remove the nested `payload` property. The checkout data should be directly in the payload.

### Logging Events

#### `embedded::log`
**Current:**
```javascript
payload: {
  event: "embedded::log",
  level: "info",
  message: "Test log message",
  context: {...},
}
```

**Update to:**
```javascript
payload: {
  level: "info",
  message: "Test log message",
  context: {...},
}
```

## Incoming Events (from host to iframe)

Update handlers for incoming messages to read from `message.payload.*`:

### `embedded::context.provide`
**Current expectation:**
```javascript
// ❌ May be reading from root
const theme = message.layout.theme;
```

**Update to:**
```javascript
// ✅ Read from payload
const theme = message.payload.layout.theme;
const width = message.payload.layout.width;
const locale = message.payload.layout.locale;
const currency = message.payload.layout.currency;
```

### `embedded::theme.change`
**Update to:**
```javascript
const theme = message.payload.theme;
```

### `embedded::nav.actionClick`
**Update to:**
```javascript
const url = message.payload.url;
const value = message.payload.value;
```

### `embedded::ui.confirm.response`
**Update to:**
```javascript
const confirmed = message.payload.confirmed;
const requestId = message.requestId;  // At root level
```

### `embedded::ui.modal.response`
**Update to:**
```javascript
const result = message.payload.result;
const error = message.payload.error;
const requestId = message.requestId;  // At root level
```

## Implementation Steps

### Step 1: Update `eventDefinitions.js`
1. Remove `event` property from all payload objects
2. For `embedded::checkout.create`, remove nested `payload` property
3. Keep all other payload properties as-is (they're already correct)

### Step 2: Update Message Sending
In `EventTriggers.jsx` or wherever messages are sent:

**Create a helper function:**
```javascript
function createMessage(event, payload, requestId = null) {
  return {
    event,
    payload,
    timestamp: Date.now(),
    source: "embedded-app",
    ...(requestId && { requestId }),
  };
}
```

**Update sendSdkEvent:**
```javascript
const sendSdkEvent = async (eventName, payload) => {
  const message = createMessage(eventName, payload);
  
  // For async events that need requestId
  if (eventName === "embedded::ui.confirm" || eventName === "embedded::ui.modal") {
    message.requestId = `req-${Date.now()}`;
  }
  
  logMessage("outgoing", message);
  window.parent.postMessage(message, "*");
};
```

### Step 3: Update Message Receiving
Update all message event listeners:

```javascript
window.addEventListener("message", (event) => {
  const message = event.data;
  
  // Verify it's a BaseMessage
  if (!message.event || !message.payload) {
    return;
  }
  
  switch (message.event) {
    case "embedded::context.provide":
      const layout = message.payload.layout;
      // Use layout.theme, layout.width, etc.
      break;
      
    case "embedded::theme.change":
      const theme = message.payload.theme;
      break;
      
    case "embedded::ui.confirm.response":
      const confirmed = message.payload.confirmed;
      const requestId = message.requestId;
      // Handle response
      break;
  }
});
```

### Step 4: Update Message Display
In `MessageLog.jsx`, update to show the new structure:
- Show `event` at root
- Show `payload` as nested object
- Show `timestamp`, `source`, `requestId` at root

## Testing Checklist

After updates:
- [ ] All outgoing events send messages with correct structure
- [ ] All incoming events parse messages from `payload` correctly
- [ ] Empty payload events (ready, destroy, auth.refresh) work correctly
- [ ] Confirm dialog generates and uses `requestId` correctly
- [ ] Context provide message reads layout data correctly
- [ ] Checkout create no longer has nested payload
- [ ] Message log displays new structure correctly
- [ ] Test app can communicate with updated merchant dashboard

## Common Mistakes to Avoid

1. **Don't include `event` in payload** - it's at root level
2. **Don't nest `payload` inside payload** - especially for checkout.create
3. **Don't forget `timestamp` and `source`** - they're required
4. **Don't put `requestId` in payload** - it's at root level
5. **Don't read from root level** - use `message.payload.*` for event data

## Reference

Compare against the merchant dashboard repository's:
- `src/components/embedded-page/core/types.ts` - BaseMessage definition
- `src/components/embedded-page/core/events.ts` - Event constants
- `src/components/embedded-page/core/postMessage.ts` - Message creation logic
- `src/components/embedded-page/modules/*/types.ts` - All message type definitions

## Priority

This is a **CRITICAL** update. The test app MUST match the merchant dashboard's structure, otherwise testing will fail and the app won't work in production.

