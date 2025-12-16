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
   * Signal iframe is ready and request merchant context
   */
  "embedded::iframe.ready": {
    category: "iframe",
    description: "Signal iframe is ready, request merchant context from host",
    payload: {
      event: "embedded::iframe.ready",
      height: document.body.scrollHeight || 600,
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
    description: "Request user logout",
    payload: {
      event: "embedded::auth.logout",
      redirectUrl: "/auth/login",
    },
    configurable: ["redirectUrl"],
    warning: "This will log out the user!",
  },

  /**
   * Request token refresh
   */
  "embedded::auth.refresh": {
    category: "auth",
    description: "Request token refresh (triggers page reload)",
    payload: {
      event: "embedded::auth.refresh",
    },
    warning: "This will reload the page!",
  },

  /**
   * Request token verification
   */
  "embedded::auth.verify": {
    category: "auth",
    description: "Request token verification via API",
    payload: {
      event: "embedded::auth.verify",
      token: "",
    },
    configurable: ["token"],
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
   * Set breadcrumb navigation
   */
  "embedded::ui.breadcrumb": {
    category: "ui",
    description: "Set custom breadcrumb navigation",
    payload: {
      event: "embedded::ui.breadcrumb",
      items: [
        { label: "Home", path: "/" },
        { label: "Products", path: "/products" },
        { label: "Edit Product" },
      ],
    },
    configurable: ["items"],
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
  // Error Reporting Events
  // ============================================

  /**
   * Report error
   */
  "embedded::error.report": {
    category: "error",
    description: "Report an error to the host for logging",
    payload: {
      event: "embedded::error.report",
      error: {
        name: "TestError",
        message: "This is a test error",
        stack: "Error: This is a test error\n    at TestConsole (test.js:1:1)",
      },
      context: {
        component: "TestConsole",
        action: "test-error-reporting",
      },
    },
    configurable: ["error", "context"],
  },
};

/**
 * Events that the parent window (host) may send to the iframe
 */
const IncomingEvents = {
  "embedded::context.provide": {
    description: "Merchant context data sent after iframe.ready",
    expectedFields: [
      "token",
      "storeId",
      "userId",
      "plan",
      "isDarkMode",
      "parentWidth",
      "baseUrl",
      "baseApiUrl",
      "locale",
    ],
  },

  "embedded::theme.change": {
    description: "Theme change notification from host",
    expectedFields: ["dark"],
  },

  "embedded::nav.actionClick": {
    description: "Primary action button was clicked by user",
    expectedFields: ["url", "value"],
  },
};

// Export for ESM consumers
export { EmbeddedEvents, IncomingEvents };

// Also attach to window for any legacy/global usage
if (typeof window !== "undefined") {
  window.EmbeddedEvents = EmbeddedEvents;
  window.IncomingEvents = IncomingEvents;
}
