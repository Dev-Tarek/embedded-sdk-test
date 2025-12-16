/**
 * Embedded SDK Test Console - Event Definitions
 * 
 * This file contains all event definitions and their default payloads
 * that can be sent to the Salla merchant dashboard parent window.
 */

const EmbeddedEvents = {
  // ============================================
  // Lifecycle Events
  // ============================================
  
  /**
   * Initialize iframe communication
   * Sent when the embedded page loads to request merchant data
   */
  'iframe.loading': {
    category: 'lifecycle',
    description: 'Initialize communication and request merchant data',
    payload: {
      event: 'iframe.loading',
      height: document.body.scrollHeight || 600
    }
  },

  /**
   * Request iframe resize
   */
  'resize': {
    category: 'lifecycle',
    description: 'Request iframe height change',
    payload: {
      event: 'resize',
      value: 800
    },
    configurable: ['value']
  },

  /**
   * Set loading state ON
   */
  'loading-on': {
    category: 'lifecycle',
    description: 'Show loading indicator (full page)',
    payload: {
      event: 'loading',
      status: false,
      mode: 'full'
    }
  },

  /**
   * Set loading state OFF
   */
  'loading-off': {
    category: 'lifecycle',
    description: 'Hide loading indicator',
    payload: {
      event: 'loading',
      status: true,
      mode: 'full'
    }
  },

  /**
   * Notify URL change
   */
  'urlChange': {
    category: 'lifecycle',
    description: 'Notify parent of URL change',
    payload: {
      event: 'urlChange',
      url: window.location.href
    }
  },

  // ============================================
  // Navigation Events
  // ============================================

  /**
   * Navigate to a path
   */
  'navigateTo': {
    category: 'navigation',
    description: 'Navigate to a specific path in the dashboard',
    payload: {
      event: 'navigateTo',
      path: '/products'
    },
    configurable: ['path']
  },

  /**
   * Redirect (alias for navigateTo)
   */
  'redirect': {
    category: 'navigation',
    description: 'Redirect to a path (same as navigateTo)',
    payload: {
      event: 'redirect',
      path: '/orders'
    },
    configurable: ['path']
  },

  /**
   * Set breadcrumb items
   */
  'breadcrumb': {
    category: 'navigation',
    description: 'Set custom breadcrumb navigation',
    payload: {
      event: 'breadcrumb',
      data: [
        { label: 'Home', path: '/' },
        { label: 'Products', path: '/products' },
        { label: 'Edit Product', path: null }
      ]
    },
    configurable: ['data']
  },

  /**
   * Set primary navigation action
   */
  'nav.primary-action': {
    category: 'navigation',
    description: 'Set primary action button in navigation',
    payload: {
      event: 'nav.primary-action',
      title: 'Add Product',
      url: '/products/new',
      value: 'create',
      extendedActions: [
        { title: 'Import Products', value: 'import' },
        { title: 'Bulk Edit', value: 'bulk-edit' }
      ]
    },
    configurable: ['title', 'url', 'value', 'extendedActions']
  },

  /**
   * Request authentication redirect
   */
  'auth::required': {
    category: 'navigation',
    description: 'Request authentication (redirects to login)',
    payload: {
      event: 'auth::required'
    },
    warning: 'This will redirect the user to the auth page!'
  },

  /**
   * Request auth refresh
   */
  'iframe.auth.refresh': {
    category: 'navigation',
    description: 'Request page reload for auth refresh',
    payload: {
      event: 'iframe.auth.refresh'
    },
    warning: 'This will reload the page!'
  },

  // ============================================
  // UI State Events
  // ============================================

  /**
   * Open overlay mode
   */
  'overlay.open': {
    category: 'ui',
    description: 'Open overlay/modal mode',
    payload: {
      event: 'overlay.open'
    }
  },

  /**
   * Close overlay mode
   */
  'overlay.close': {
    category: 'ui',
    description: 'Close overlay/modal mode',
    payload: {
      event: 'overlay.close'
    }
  },

  /**
   * Open Doka image editor
   */
  'doka.open': {
    category: 'ui',
    description: 'Open Doka image editor overlay',
    payload: {
      event: 'doka.open'
    }
  },

  /**
   * Close Doka image editor
   */
  'doka.close': {
    category: 'ui',
    description: 'Close Doka image editor overlay',
    payload: {
      event: 'doka.close'
    }
  },

  /**
   * Open Salla GPT widget
   */
  'open_salla_gpt': {
    category: 'ui',
    description: 'Open Salla GPT chat widget',
    payload: {
      event: 'open_salla_gpt'
    }
  },

  /**
   * Close Salla GPT widget
   */
  'close_salla_gpt': {
    category: 'ui',
    description: 'Close Salla GPT chat widget',
    payload: {
      event: 'close_salla_gpt'
    }
  },

  // ============================================
  // Business Events
  // ============================================

  /**
   * Checkout created event
   */
  'checkout.create': {
    category: 'business',
    description: 'Dispatch checkout creation event',
    payload: {
      event: 'checkout.create',
      payload: {
        checkoutId: 'CHK_' + Date.now(),
        amount: 299.99,
        currency: 'SAR',
        items: [
          { id: 'PROD_001', name: 'Test Product', quantity: 1, price: 299.99 }
        ]
      }
    },
    configurable: ['payload']
  },

  /**
   * Coupon created event
   */
  'coupon.created': {
    category: 'business',
    description: 'Dispatch coupon creation event',
    payload: {
      event: 'coupon.created',
      payload: {
        code: 'SAVE20',
        discount: 20,
        type: 'percentage',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    configurable: ['payload']
  },

  /**
   * Page added event
   */
  'page.added': {
    category: 'business',
    description: 'Dispatch page added event',
    payload: {
      event: 'page.added',
      payload: 'custom_page'
    },
    configurable: ['payload']
  },

  /**
   * Ad banner created event
   */
  'adBanner.create': {
    category: 'business',
    description: 'Dispatch ad banner creation event',
    payload: {
      event: 'adBanner.create',
      payload: {
        id: 'BANNER_' + Date.now(),
        title: 'Summer Sale',
        imageUrl: 'https://example.com/banner.jpg',
        targetUrl: '/promotions/summer'
      }
    },
    configurable: ['payload']
  },

  /**
   * Abandoned cart reminder sent
   */
  'abandonedCartReminder.sent': {
    category: 'business',
    description: 'Dispatch abandoned cart reminder event',
    payload: {
      event: 'abandonedCartReminder.sent',
      payload: {
        cartId: 'CART_' + Date.now(),
        customerId: 'CUST_12345',
        reminderType: 'email',
        sentAt: new Date().toISOString()
      }
    },
    configurable: ['payload']
  },

  /**
   * Store identity added
   */
  'store.identity.added': {
    category: 'business',
    description: 'Dispatch store identity event',
    payload: {
      event: 'store.identity.added',
      payload: {
        platform: 'instagram',
        handle: '@mystore',
        url: 'https://instagram.com/mystore'
      }
    },
    configurable: ['payload']
  },

  /**
   * SBC (Saudi Business Center) added
   */
  'sbc.added': {
    category: 'business',
    description: 'Dispatch SBC number added event',
    payload: {
      event: 'sbc.added',
      payload: '1234567890'
    },
    configurable: ['payload']
  },

  /**
   * Dispatch mobile event
   */
  'dispatchMobileEvent': {
    category: 'business',
    description: 'Dispatch custom mobile app event',
    payload: {
      event: 'dispatchMobileEvent',
      eventName: 'custom.mobile.event',
      payload: {
        action: 'test',
        data: { key: 'value' }
      }
    },
    configurable: ['eventName', 'payload']
  }
};

/**
 * Events that the parent window may send to the iframe
 */
const IncomingEvents = {
  'iframe.loading': {
    description: 'Response with merchant data, token, and settings',
    expectedFields: [
      's-store-id',
      'plan',
      'userId',
      'parentWidth',
      'dark',
      'token',
      'baseUrl',
      'baseApiUrl',
      'legacy'
    ]
  },
  
  'iframe.legacy.auth': {
    description: 'Legacy auth token for app mode',
    expectedFields: ['token']
  },
  
  'salla::theme.change': {
    description: 'Theme change notification',
    expectedFields: ['dark']
  },
  
  'nav.primary-action.clicked': {
    description: 'Primary action button was clicked',
    expectedFields: ['url']
  }
};

// Export for use in app.js
if (typeof window !== 'undefined') {
  window.EmbeddedEvents = EmbeddedEvents;
  window.IncomingEvents = IncomingEvents;
}

