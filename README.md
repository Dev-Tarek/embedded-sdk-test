# Embedded SDK Test Console v1.0

A developer testing tool for the Salla Embedded SDK postMessage communication.

## Overview

This test console allows you to simulate and debug the communication between an embedded third-party app (iframe) and the Salla Dashboard (host). It sends and receives events using the `postMessage` API with the new `embedded::` namespaced event contract.

## Usage

1. Open this app inside an iframe within the Salla Dashboard
2. The console will auto-send `embedded::iframe.ready` to request context
3. Use the buttons to trigger various events
4. Monitor the message log for incoming/outgoing events

## Event Reference

All events use the `embedded::` namespace prefix.

### Outgoing Events (App → Host)

#### Iframe Lifecycle

| Event                     | Description                                   |
| ------------------------- | --------------------------------------------- |
| `embedded::iframe.ready`  | Signal app is ready, request merchant context |
| `embedded::iframe.resize` | Request iframe height change                  |

#### Authentication

| Event                    | Description                             |
| ------------------------ | --------------------------------------- |
| `embedded::auth.logout`  | Request user logout                     |
| `embedded::auth.refresh` | Request token refresh (triggers reload) |
| `embedded::auth.verify`  | Request token verification              |

#### Page Navigation

| Event                     | Description                        |
| ------------------------- | ---------------------------------- |
| `embedded::page.navigate` | SPA navigation within dashboard    |
| `embedded::page.redirect` | Full page redirect to external URL |

#### Navigation Bar

| Event                     | Description                     |
| ------------------------- | ------------------------------- |
| `embedded::nav.setAction` | Set/clear primary action button |

#### UI State

| Event                     | Description                 |
| ------------------------- | --------------------------- |
| `embedded::ui.loading`    | Show/hide loading indicator |
| `embedded::ui.breadcrumb` | Set breadcrumb navigation   |
| `embedded::ui.overlay`    | Enter/exit overlay mode     |
| `embedded::ui.toast`      | Show toast notification     |
| `embedded::ui.modal`      | Open/close modal dialog     |

#### Business

| Event                       | Description               |
| --------------------------- | ------------------------- |
| `embedded::checkout.create` | Initiate checkout process |

#### Error

| Event                    | Description          |
| ------------------------ | -------------------- |
| `embedded::error.report` | Report error to host |

### Incoming Events (Host → App)

| Event                       | Description                             |
| --------------------------- | --------------------------------------- |
| `embedded::context.provide` | Merchant context (token, storeId, etc.) |
| `embedded::theme.change`    | Theme changed notification              |
| `embedded::nav.actionClick` | Primary action button was clicked       |

## Context Data

When connected, the host provides:

| Field         | Type      | Description                |
| ------------- | --------- | -------------------------- |
| `token`       | `string`  | Access token for API calls |
| `storeId`     | `number`  | Current store ID           |
| `userId`      | `number`  | Current user ID            |
| `plan`        | `string`  | Merchant plan name         |
| `locale`      | `string`  | Current locale code        |
| `isDarkMode`  | `boolean` | Dark mode enabled          |
| `parentWidth` | `number`  | Parent container width     |
| `baseUrl`     | `string`  | Dashboard base URL         |
| `baseApiUrl`  | `string`  | API base URL               |

## Event Payloads

### `embedded::iframe.ready`

```json
{
  "event": "embedded::iframe.ready",
  "height": 600
}
```

### `embedded::iframe.resize`

```json
{
  "event": "embedded::iframe.resize",
  "height": 800
}
```

### `embedded::auth.logout`

```json
{
  "event": "embedded::auth.logout",
  "redirectUrl": "/auth/login"
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
  "status": true,
  "mode": "full"
}
```

### `embedded::ui.breadcrumb`

```json
{
  "event": "embedded::ui.breadcrumb",
  "items": [
    { "label": "Home", "path": "/" },
    { "label": "Products", "path": "/products" },
    { "label": "Edit Product" }
  ]
}
```

### `embedded::ui.overlay`

```json
{
  "event": "embedded::ui.overlay",
  "action": "open"
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

### `embedded::ui.modal`

```json
{
  "event": "embedded::ui.modal",
  "action": "open",
  "id": "confirm-dialog",
  "content": { "title": "Confirm", "body": "Are you sure?" }
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

### `embedded::error.report`

```json
{
  "event": "embedded::error.report",
  "error": {
    "name": "Error",
    "message": "Something went wrong",
    "stack": "..."
  },
  "context": {
    "component": "ProductList",
    "action": "fetch"
  }
}
```

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling with dark/light theme support
- `events.js` - Event definitions and payloads
- `app.js` - Application logic

## Development

Simply open `index.html` in a browser or serve via HTTP.

For testing with the dashboard, embed this app via iframe:

```html
<iframe src="http://localhost:3000/embedded-sdk-test/"></iframe>
```

## License

Copyright 2024 Salla
