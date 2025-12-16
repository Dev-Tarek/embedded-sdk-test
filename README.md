# Embedded SDK Test Console

A developer tool for testing postMessage communication between embedded iframes and the Salla merchant dashboard.

## Purpose

This test console simulates an embedded application within the Salla dashboard, allowing developers to:

- **Trigger events** that an embedded page would send to the parent dashboard
- **Monitor incoming messages** from the parent window
- **Debug communication** between iframe and parent
- **Test all supported events** defined in `Embedded.page.tsx`

## Usage

### As an Embedded Page

1. Deploy this application to a hosting service (e.g., Netlify)
2. Use the deployed URL as an embedded app URL in the Salla dashboard
3. The console will auto-initialize and show received merchant data

### Standalone Testing

1. Open `index.html` directly in a browser
2. Use the event buttons to see the payloads that would be sent
3. Check the console for debug information

## Supported Events

### Events Sent TO Dashboard (iframe → parent)

| Event | Description |
|-------|-------------|
| `iframe.loading` | Initialize communication, request merchant data |
| `resize` | Request iframe height change |
| `loading` | Set loading indicator state |
| `urlChange` | Notify parent of URL changes |
| `navigateTo` | Navigate to a dashboard path |
| `redirect` | Redirect to a path |
| `breadcrumb` | Set custom breadcrumb navigation |
| `nav.primary-action` | Set primary action button |
| `auth::required` | Request auth redirect |
| `iframe.auth.refresh` | Request page reload |
| `overlay.open/close` | Control overlay state |
| `doka.open/close` | Control Doka editor state |
| `open/close_salla_gpt` | Control GPT widget |
| `checkout.create` | Dispatch checkout event |
| `coupon.created` | Dispatch coupon event |
| `page.added` | Dispatch page added event |
| `adBanner.create` | Dispatch ad banner event |
| `abandonedCartReminder.sent` | Dispatch cart reminder event |
| `store.identity.added` | Dispatch store identity event |
| `sbc.added` | Dispatch SBC added event |
| `dispatchMobileEvent` | Dispatch mobile app event |

### Events Received FROM Dashboard (parent → iframe)

| Event | Description |
|-------|-------------|
| `iframe.loading` | Merchant data, token, settings |
| `iframe.legacy.auth` | Legacy auth token |
| `salla::theme.change` | Theme change notification |
| `nav.primary-action.clicked` | Primary action was clicked |

## Features

- **Real-time Message Log**: See all sent/received messages with timestamps
- **Received Data Panel**: View parsed merchant data and settings
- **Payload Editor**: Customize event payloads before sending
- **Theme Support**: Light/dark mode that syncs with parent
- **Connection Status**: Visual indicator of communication state

## URL Parameters

| Parameter | Description |
|-----------|-------------|
| `dark=true` | Start in dark mode |
| `mode=iframe` | Explicitly set mode |

## Development

```bash
# Clone the repository
git clone git@github.com:Dev-Tarek/embedded-sdk-test.git

# Open in browser
open index.html

# Or serve locally
npx serve .
```

## File Structure

```
embedded-sdk-test/
├── index.html      # Main UI
├── styles.css      # Styling with theme support
├── events.js       # Event definitions and payloads
├── app.js          # Application logic
└── README.md       # Documentation
```

## License

MIT

