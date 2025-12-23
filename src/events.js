/**
 * Embedded SDK Test Console - Event Definitions
 *
 * Updated to match the new EmbeddedPage component event contract.
 * All events use the `embedded::` namespace prefix.
 */

/* eslint-env browser */
/* global document, window */

const EmbeddedEvents = {
  // ============================================
  // Iframe Lifecycle Events
  // ============================================

  /**
   * Signal iframe is ready and request layout context
   */
  "embedded::iframe.ready": {
    category: "iframe",
    description: "Init handshake - request layout context from host",
    payload: {
      event: "embedded::iframe.ready",
      height: document.body.scrollHeight || 600,
    },
  },

  /**
   * Signal app is fully loaded (removes host loading overlay)
   */
  "embedded::ready": {
    category: "iframe",
    description: "Signal app is fully loaded and ready",
    payload: {
      event: "embedded::ready",
    },
  },

  /**
   * Request iframe resize
   */
  "embedded::iframe.resize": {
    category: "iframe",
    description: "Request iframe height change",
    payload: {
      event: "embedded::iframe.resize",
      height: 800,
    },
    configurable: ["height"],
  },

  // ============================================
  // Authentication Events
  // ============================================

  /**
   * Request logout
   */
  "embedded::auth.logout": {
    category: "auth",
    description: "Navigate to installed apps page",
    payload: {
      event: "embedded::auth.logout",
    },
    warning: "This will navigate away from the app!",
  },

  /**
   * Request token refresh
   */
  "embedded::auth.refresh": {
    category: "auth",
    description: "Request iframe re-render with new token",
    payload: {
      event: "embedded::auth.refresh",
    },
    warning: "This will reload the iframe!",
  },

  /**
   * Signal auth error
   */
  "embedded::auth.error": {
    category: "auth",
    description: "Signal auth error (navigate away with toast)",
    payload: {
      event: "embedded::auth.error",
      message: "Token verification failed",
    },
    configurable: ["message"],
    warning: "This will navigate away from the app!",
  },

  // ============================================
  // Page Navigation Events
  // ============================================

  /**
   * Navigate to internal path (SPA)
   */
  "embedded::page.navigate": {
    category: "page",
    description: "Navigate to internal dashboard path (SPA navigation)",
    payload: {
      event: "embedded::page.navigate",
      path: "/products",
      state: {},
      replace: false,
    },
    configurable: ["path", "state", "replace"],
  },

  /**
   * Redirect to external URL
   */
  "embedded::page.redirect": {
    category: "page",
    description: "Redirect to external URL (full page redirect)",
    payload: {
      event: "embedded::page.redirect",
      url: "https://salla.sa",
    },
    configurable: ["url"],
  },

  /**
   * Set page title
   */
  "embedded::page.setTitle": {
    category: "page",
    description: "Set document title in host",
    payload: {
      event: "embedded::page.setTitle",
      title: "My App - Product Details",
    },
    configurable: ["title"],
  },

  // ============================================
  // Navigation Bar Events
  // ============================================

  /**
   * Set primary navigation action button
   */
  "embedded::nav.setAction": {
    category: "nav",
    description: "Set primary action button in navigation bar",
    payload: {
      event: "embedded::nav.setAction",
      title: "Add Product",
      url: "/products/new",
      value: "create",
      extendedActions: [
        { title: "Import Products", value: "import" },
        { title: "Bulk Edit", value: "bulk-edit" },
      ],
    },
    configurable: ["title", "url", "value", "extendedActions"],
  },

  /**
   * Clear primary navigation action
   */
  "embedded::nav.clearAction": {
    category: "nav",
    description: "Clear primary action button",
    payload: {
      event: "embedded::nav.setAction",
      title: "",
    },
  },

  // ============================================
  // UI Events
  // ============================================

  /**
   * Show loading indicator
   */
  "embedded::ui.loading-show": {
    category: "ui",
    description: "Show loading indicator (content not ready)",
    payload: {
      event: "embedded::ui.loading",
      status: false,
      mode: "full",
    },
    configurable: ["mode"],
  },

  /**
   * Hide loading indicator
   */
  "embedded::ui.loading-hide": {
    category: "ui",
    description: "Hide loading indicator (content ready)",
    payload: {
      event: "embedded::ui.loading",
      status: true,
      mode: "full",
    },
    configurable: ["mode"],
  },

  /**
   * Open overlay mode
   */
  "embedded::ui.overlay-open": {
    category: "ui",
    description: "Enter fullscreen overlay mode",
    payload: {
      event: "embedded::ui.overlay",
      action: "open",
    },
  },

  /**
   * Close overlay mode
   */
  "embedded::ui.overlay-close": {
    category: "ui",
    description: "Exit overlay mode",
    payload: {
      event: "embedded::ui.overlay",
      action: "close",
    },
  },

  /**
   * Show success toast
   */
  "embedded::ui.toast-success": {
    category: "ui",
    description: "Show success toast notification",
    payload: {
      event: "embedded::ui.toast",
      type: "success",
      message: "Operation completed successfully!",
      duration: 3000,
    },
    configurable: ["message", "duration"],
  },

  /**
   * Show error toast
   */
  "embedded::ui.toast-error": {
    category: "ui",
    description: "Show error toast notification",
    payload: {
      event: "embedded::ui.toast",
      type: "error",
      message: "Something went wrong!",
      duration: 5000,
    },
    configurable: ["message", "duration"],
  },

  /**
   * Show warning toast
   */
  "embedded::ui.toast-warning": {
    category: "ui",
    description: "Show warning toast notification",
    payload: {
      event: "embedded::ui.toast",
      type: "warning",
      message: "Please review your input",
      duration: 4000,
    },
    configurable: ["message", "duration"],
  },

  /**
   * Show info toast
   */
  "embedded::ui.toast-info": {
    category: "ui",
    description: "Show info toast notification",
    payload: {
      event: "embedded::ui.toast",
      type: "info",
      message: "New features available",
      duration: 3000,
    },
    configurable: ["message", "duration"],
  },

  /**
   * Open modal
   */
  "embedded::ui.modal-open": {
    category: "ui",
    description: "Open a modal dialog",
    payload: {
      event: "embedded::ui.modal",
      action: "open",
      id: "confirm-dialog",
      content: { title: "Confirm Action", body: "Are you sure?" },
    },
    configurable: ["id", "content"],
  },

  /**
   * Close modal
   */
  "embedded::ui.modal-close": {
    category: "ui",
    description: "Close a modal dialog",
    payload: {
      event: "embedded::ui.modal",
      action: "close",
      id: "confirm-dialog",
    },
    configurable: ["id"],
  },

  /**
   * Confirm dialog (async)
   * Returns a Promise with the user's choice
   */
  "embedded::ui.confirm": {
    category: "ui",
    description: "Show confirm dialog (async - returns result)",
    payload: {
      event: "embedded::ui.confirm",
      title: "Delete Product?",
      message:
        "This action cannot be undone. Are you sure you want to proceed?",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    },
    configurable: ["title", "message", "confirmText", "cancelText", "variant"],
    async: true,
  },

  // ============================================
  // Checkout Events
  // ============================================

  /**
   * Create checkout
   */
  "embedded::checkout.create": {
    category: "checkout",
    description: "Initiate checkout process",
    payload: {
      event: "embedded::checkout.create",
      payload: {
        checkoutId: "CHK_" + Date.now(),
        amount: 299.99,
        currency: "SAR",
        items: [
          { id: "PROD_001", name: "Test Product", quantity: 1, price: 299.99 },
        ],
      },
    },
    configurable: ["payload"],
  },

  // ============================================
  // Logging Events
  // ============================================

  /**
   * Send log message
   */
  "embedded::log": {
    category: "log",
    description: "Send log message to host",
    payload: {
      event: "embedded::log",
      level: "info",
      message: "Test log message from embedded app",
      context: {
        component: "TestConsole",
        action: "test-logging",
      },
    },
    configurable: ["level", "message", "context"],
  },
};

/**
 * Events that the parent window (host) may send to the iframe
 */
const IncomingEvents = {
  "embedded::context.provide": {
    description: "Layout context data sent after iframe.ready",
    expectedFields: [
      "layout.theme",
      "layout.width",
      "layout.locale",
      "layout.currency",
    ],
  },

  "embedded::theme.change": {
    description: "Theme change notification from host",
    expectedFields: ["theme"],
  },

  "embedded::nav.actionClick": {
    description: "Primary action button was clicked by user",
    expectedFields: ["url", "value"],
  },

  "embedded::ui.confirm.response": {
    description: "Response to confirm dialog request",
    expectedFields: ["requestId", "confirmed"],
  },

  "embedded::ui.modal.response": {
    description: "Response to modal request",
    expectedFields: ["requestId", "result", "error"],
  },
};

// Export for ESM consumers
export { EmbeddedEvents, IncomingEvents };

// Also attach to window for any legacy/global usage
if (typeof window !== "undefined") {
  window.EmbeddedEvents = EmbeddedEvents;
  window.IncomingEvents = IncomingEvents;
}
