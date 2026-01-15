# Embedded SDK Test Console v0.1.0-beta.11

A developer testing tool for the Salla Embedded SDK postMessage communication.

## Overview

This test console allows you to simulate and debug the communication between an embedded third-party app (iframe) and the Salla Dashboard (host). It sends and receives events using the `@salla.sa/embedded-sdk` package.

## Bootstrap Flow

The test console demonstrates the complete authentication flow:

```
1. embedded.init() - Initialize SDK and get layout info
2. embedded.auth.getToken() - Get token from URL (?token=XXX)
3. Verify token with Salla API
4. embedded.ready() - Signal app is ready (removes host loading)
   OR embedded.destroy() - Exit embedded view
```

## Usage

1. Open this app inside an iframe within the Salla Dashboard
2. The console will auto-run the bootstrap flow
3. Use the buttons to trigger various events
4. Monitor the message log for incoming/outgoing events

## Event Reference

All events use the `embedded::` namespace prefix.

### Outgoing Events (App → Host)

#### Iframe Lifecycle

| Event                     | Description                          |
| ------------------------- | ------------------------------------ |
| `embedded::iframe.ready`  | Init handshake, request layout info  |
| `embedded::ready`         | Signal app is fully loaded and ready |
| `embedded::iframe.resize` | Request iframe height change         |
| `embedded::destroy`       | Exit embedded view                   |

#### Authentication

| Event                    | Description                     |
| ------------------------ | ------------------------------- |
| `embedded::auth.refresh` | Re-render iframe with new token |

#### Page Navigation

| Event                     | Description                        |
| ------------------------- | ---------------------------------- |
| `embedded::page.navigate` | SPA navigation within dashboard    |
| `embedded::page.redirect` | Full page redirect to external URL |
| `embedded::page.setTitle` | Set document title in host         |

#### Navigation Bar

| Event                     | Description                     |
| ------------------------- | ------------------------------- |
| `embedded::nav.setAction` | Set/clear primary action button |

#### UI State

| Event                  | Description                 |
| ---------------------- | --------------------------- |
| `embedded::ui.loading` | Show/hide loading indicator |
| `embedded::ui.toast`   | Show toast notification     |
| `embedded::ui.modal`   | Open/close modal dialog     |
| `embedded::ui.confirm` | Show confirm dialog (async) |

#### Business

| Event                       | Description               |
| --------------------------- | ------------------------- |
| `embedded::checkout.create` | Initiate checkout process |

#### Logging

| Event           | Description              |
| --------------- | ------------------------ |
| `embedded::log` | Send log message to host |

### Incoming Events (Host → App)

| Event                           | Description                      |
| ------------------------------- | -------------------------------- |
| `embedded::context.provide`     | Layout info (theme, width, etc.) |
| `embedded::theme.change`        | Theme changed notification       |
| `embedded::nav.actionClick`     | Primary action button clicked    |
| `embedded::ui.confirm.response` | Confirm dialog response          |

## Layout Data

When connected, the host provides layout info:

| Field      | Type                | Description            |
| ---------- | ------------------- | ---------------------- |
| `theme`    | `'light' \| 'dark'` | Current theme          |
| `width`    | `number`            | Parent container width |
| `locale`   | `string`            | Current locale code    |
| `currency` | `string`            | Current currency code  |

## Token Verification

The test console verifies tokens using the Salla API:

**Endpoint:**

```
POST https://exchange-authority-service-dev-59.merchants.workers.dev/exchange-authority/v1/verify
```

**Headers:**

```
s-source: app
Content-Type: application/json
```

**Request:**

```json
{
  "token": "<token_from_url>",
  "iss": "salla-partners",
  "subject": "apps",
  "env": "dev"
}
```

**Response:**

```json
{
  "status": 200,
  "success": true,
  "data": {
    "store_id": 123,
    "user_id": 123,
    "owner_id": 123,
    "exp": "2026-12-22T10:27:40Z"
  }
}
```

## Event Payloads

### `embedded::iframe.ready`

```json
{
  "event": "embedded::iframe.ready",
  "height": 600
}
```

### `embedded::ready`

```json
{
  "event": "embedded::ready"
}
```

### `embedded::auth.refresh`

```json
{
  "event": "embedded::auth.refresh"
}
```

### `embedded::destroy`

```json
{
  "event": "embedded::destroy"
}
```

### `embedded::page.navigate`

```json
{
  "event": "embedded::page.navigate",
  "path": "/products",
  "state": {},
  "replace": false
}
```

### `embedded::page.redirect`

```json
{
  "event": "embedded::page.redirect",
  "url": "https://external-site.com"
}
```

### `embedded::page.setTitle`

```json
{
  "event": "embedded::page.setTitle",
  "title": "My App - Product Details"
}
```

### `embedded::nav.setAction`

```json
{
  "event": "embedded::nav.setAction",
  "title": "Add Product",
  "url": "/products/new",
  "value": "create",
  "extendedActions": [
    { "title": "Import", "value": "import" },
    { "title": "Export", "value": "export" }
  ]
}
```

### `embedded::ui.loading`

```json
{
  "event": "embedded::ui.loading",
  "status": false,
  "mode": "full"
}
```

### `embedded::ui.toast`

```json
{
  "event": "embedded::ui.toast",
  "type": "success",
  "message": "Operation completed!",
  "duration": 3000
}
```

### `embedded::ui.confirm`

```json
{
  "event": "embedded::ui.confirm",
  "title": "Delete Product?",
  "message": "This action cannot be undone.",
  "confirmText": "Delete",
  "cancelText": "Cancel",
  "variant": "danger"
}
```

### `embedded::checkout.create`

```json
{
  "event": "embedded::checkout.create",
  "payload": {
    "amount": 299.99,
    "currency": "SAR",
    "items": [{ "id": "PROD_001", "quantity": 1 }]
  }
}
```

### `embedded::log`

```json
{
  "event": "embedded::log",
  "level": "info",
  "message": "Test log message",
  "context": {
    "component": "TestConsole"
  }
}
```

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling with dark/light theme support
- `src/events.js` - Event definitions and payloads
- `src/app.js` - Application logic with bootstrap flow
- `src/main.js` - Entry point

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

For testing with the dashboard, embed this app via iframe with a token:

```html
<iframe src="http://localhost:5173/?token=XXX"></iframe>
```

## License

Copyright 2024 Salla
