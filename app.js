/**
 * Embedded SDK Test Console - Main Application
 * 
 * Handles postMessage communication, UI interactions,
 * and event logging for testing embedded iframe functionality.
 */

/* eslint-env browser */
/* global EmbeddedEvents */

(function() {
  'use strict';

  // ============================================
  // State
  // ============================================
  
  const state = {
    isConnected: false,
    parentOrigin: null,
    merchantData: null,
    messageLog: [],
    isDarkMode: localStorage.getItem('theme') === 'dark',
    filterUnknown: true
  };

  // ============================================
  // DOM Elements
  // ============================================
  
  const elements = {
    themeToggle: document.getElementById('theme-toggle'),
    connectionStatus: document.getElementById('connection-status'),
    parentOrigin: document.getElementById('parent-origin'),
    iframeMode: document.getElementById('iframe-mode'),
    messageLog: document.getElementById('message-log'),
    clearLog: document.getElementById('clear-log'),
    copyLog: document.getElementById('copy-log'),
    filterUnknown: document.getElementById('filter-unknown'),
    payloadEditor: document.getElementById('payload-editor'),
    sendCustom: document.getElementById('send-custom'),
    toastContainer: document.getElementById('toast-container'),
    
    // Data display elements
    dataStoreId: document.getElementById('data-store-id'),
    dataUserId: document.getElementById('data-user-id'),
    dataPlan: document.getElementById('data-plan'),
    dataDarkMode: document.getElementById('data-dark-mode'),
    dataToken: document.getElementById('data-token'),
    dataBaseUrl: document.getElementById('data-base-url'),
    dataBaseApiUrl: document.getElementById('data-base-api-url'),
    dataParentWidth: document.getElementById('data-parent-width')
  };

  // ============================================
  // Theme Management
  // ============================================
  
  function initTheme() {
    // Check URL params for dark mode
    const urlParams = new URLSearchParams(window.location.search);
    const darkParam = urlParams.get('dark');
    
    if (darkParam !== null) {
      state.isDarkMode = darkParam === 'true' || darkParam === '1';
    }
    
    applyTheme();
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', state.isDarkMode ? 'dark' : 'light');
  }

  function toggleTheme() {
    state.isDarkMode = !state.isDarkMode;
    applyTheme();
    
    // Notify parent of theme preference (optional)
    log('Theme changed to: ' + (state.isDarkMode ? 'dark' : 'light'), 'info');
  }

  // ============================================
  // PostMessage Communication
  // ============================================
  
  function sendMessage(eventData) {
    const target = window.parent !== window ? window.parent : window.opener;
    
    if (!target || target === window) {
      showToast('No parent window detected. Open this page in an iframe.', 'error');
      logMessage('outgoing', eventData, 'No parent window');
      return false;
    }

    try {
      // Send to parent with * origin (in production, use specific origin)
      target.postMessage(eventData, '*');
      logMessage('outgoing', eventData);
      return true;
    } catch (error) {
      showToast('Failed to send message: ' + error.message, 'error');
      logMessage('outgoing', eventData, error.message);
      return false;
    }
  }

  function handleIncomingMessage(event) {
    // Log all incoming messages
    logMessage('incoming', event.data, null, event.origin);

    // Update connection status on first message
    if (!state.isConnected && event.data && event.data.event) {
      setConnected(true, event.origin);
    }

    // Handle specific events
    if (!event.data || !event.data.event) return;

    switch (event.data.event) {
      case 'iframe.loading':
        handleIframeLoadingResponse(event.data);
        break;
      
      case 'iframe.legacy.auth':
        handleLegacyAuth(event.data);
        break;
      
      case 'salla::theme.change':
        handleThemeChange(event.data);
        break;
      
      case 'nav.primary-action.clicked':
        handlePrimaryActionClicked(event.data);
        break;
      
      default:
        log('Received unknown event: ' + event.data.event);
    }
  }

  function handleIframeLoadingResponse(data) {
    state.merchantData = data;
    
    // Update data display
    updateDataDisplay({
      storeId: data['s-store-id'],
      userId: data.userId,
      plan: data.plan,
      darkMode: data.dark,
      token: data.token,
      baseUrl: data.baseUrl,
      baseApiUrl: data.baseApiUrl,
      parentWidth: data.parentWidth
    });

    // Apply theme from parent if specified
    if (typeof data.dark === 'boolean') {
      state.isDarkMode = data.dark;
      applyTheme();
    }

    showToast('Connected! Received merchant data.', 'success');
  }

  function handleLegacyAuth(data) {
    if (data.token) {
      elements.dataToken.textContent = maskToken(data.token);
      elements.dataToken.title = data.token;
      showToast('Received legacy auth token', 'info');
    }
  }

  function handleThemeChange(data) {
    if (typeof data.dark === 'boolean') {
      state.isDarkMode = data.dark;
      applyTheme();
      elements.dataDarkMode.textContent = data.dark ? 'Enabled' : 'Disabled';
      showToast('Theme changed by parent: ' + (data.dark ? 'Dark' : 'Light'), 'info');
    }
  }

  function handlePrimaryActionClicked(data) {
    showToast('Primary action clicked! URL: ' + (data.url || 'N/A'), 'info');
    log('Primary action triggered with value: ' + JSON.stringify(data));
  }

  // ============================================
  // UI Updates
  // ============================================
  
  function setConnected(connected, origin = null) {
    state.isConnected = connected;
    state.parentOrigin = origin;
    
    elements.connectionStatus.className = 'status-badge ' + 
      (connected ? 'status-connected' : 'status-disconnected');
    elements.connectionStatus.innerHTML = 
      '<span class="status-dot"></span>' + 
      (connected ? 'Connected' : 'Waiting for Parent');
    
    if (origin) {
      elements.parentOrigin.textContent = origin;
    }
  }

  function updateDataDisplay(data) {
    if (data.storeId) elements.dataStoreId.textContent = data.storeId;
    if (data.userId) elements.dataUserId.textContent = data.userId;
    if (data.plan) elements.dataPlan.textContent = data.plan;
    if (typeof data.darkMode === 'boolean') {
      elements.dataDarkMode.textContent = data.darkMode ? 'Enabled' : 'Disabled';
    }
    if (data.token) {
      elements.dataToken.textContent = maskToken(data.token);
      elements.dataToken.title = 'Click to copy';
    }
    if (data.baseUrl) {
      elements.dataBaseUrl.textContent = data.baseUrl;
      elements.dataBaseUrl.title = data.baseUrl;
    }
    if (data.baseApiUrl) {
      elements.dataBaseApiUrl.textContent = data.baseApiUrl;
      elements.dataBaseApiUrl.title = data.baseApiUrl;
    }
    if (data.parentWidth) {
      elements.dataParentWidth.textContent = data.parentWidth + 'px';
    }
  }

  function maskToken(token) {
    if (!token || token.length < 20) return token;
    return token.substring(0, 10) + '...' + token.substring(token.length - 10);
  }

  // ============================================
  // Message Logging
  // ============================================
  
  function logMessage(direction, data, error = null, origin = null) {
    const entry = {
      time: new Date().toISOString(),
      direction,
      event: data?.event || 'unknown',
      data,
      error,
      origin
    };
    
    state.messageLog.push(entry);
    renderLogEntry(entry);
  }

  function renderLogEntry(entry) {
    // Check if we should filter this entry
    if (state.filterUnknown && entry.event === 'unknown') {
      return;
    }

    // Remove empty state if present
    const emptyState = elements.messageLog.querySelector('.log-empty');
    if (emptyState) {
      emptyState.remove();
    }

    const div = document.createElement('div');
    div.className = 'log-entry';
    div.dataset.event = entry.event;
    
    const time = new Date(entry.time);
    const timeStr = time.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });

    const directionIcon = entry.direction === 'outgoing' ? '→' : '←';
    const directionClass = entry.direction;
    
    let dataStr = '';
    try {
      dataStr = JSON.stringify(entry.data, null, 0);
      if (dataStr.length > 100) {
        dataStr = dataStr.substring(0, 100) + '...';
      }
    } catch (e) {
      dataStr = String(entry.data);
    }

    div.innerHTML = `
      <span class="log-time">${timeStr}</span>
      <span class="log-direction ${directionClass}">${directionIcon}</span>
      <span class="log-event">${entry.event}</span>
      <span class="log-data">${escapeHtml(dataStr)}</span>
    `;

    // Make entry clickable to show full data
    div.style.cursor = 'pointer';
    div.addEventListener('click', () => {
      elements.payloadEditor.value = JSON.stringify(entry.data, null, 2);
      showToast('Payload copied to editor', 'info');
    });

    elements.messageLog.appendChild(div);
    elements.messageLog.scrollTop = elements.messageLog.scrollHeight;
  }

  function rerenderLog() {
    // Clear current display
    elements.messageLog.innerHTML = '';
    
    // Re-render all entries with current filter
    state.messageLog.forEach(entry => {
      renderLogEntry(entry);
    });

    // Show empty state if no visible entries
    if (elements.messageLog.children.length === 0) {
      elements.messageLog.innerHTML = `
        <div class="log-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <p>No messages yet</p>
          <span>Click "Initialize" to start communication</span>
        </div>
      `;
    }
  }

  function clearLog() {
    state.messageLog = [];
    elements.messageLog.innerHTML = `
      <div class="log-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>No messages yet</p>
        <span>Click "Initialize" to start communication</span>
      </div>
    `;
    showToast('Log cleared', 'info');
  }

  function copyLog() {
    const logText = state.messageLog.map(entry => {
      return `[${entry.time}] ${entry.direction === 'outgoing' ? '→' : '←'} ${entry.event}: ${JSON.stringify(entry.data)}`;
    }).join('\n');
    
    navigator.clipboard.writeText(logText).then(() => {
      showToast('Log copied to clipboard', 'success');
    }).catch(() => {
      showToast('Failed to copy log', 'error');
    });
  }

  // ============================================
  // Event Handlers
  // ============================================
  
  function handleEventButtonClick(eventName) {
    const eventDef = window.EmbeddedEvents[eventName];
    
    if (!eventDef) {
      showToast('Unknown event: ' + eventName, 'error');
      return;
    }

    // Check for warning
    if (eventDef.warning) {
      if (!confirm(eventDef.warning + '\n\nContinue?')) {
        return;
      }
    }

    // Create payload with dynamic values
    let payload = JSON.parse(JSON.stringify(eventDef.payload));
    
    // Update dynamic values
    if (eventName === 'iframe.loading') {
      payload.height = document.body.scrollHeight || 600;
    } else if (eventName === 'urlChange') {
      payload.url = window.location.href;
    }

    // Update editor with current payload
    elements.payloadEditor.value = JSON.stringify(payload, null, 2);
    
    // Send the message
    sendMessage(payload);
  }

  function handleSendCustom() {
    try {
      const payload = JSON.parse(elements.payloadEditor.value);
      sendMessage(payload);
    } catch (error) {
      showToast('Invalid JSON: ' + error.message, 'error');
    }
  }

  // ============================================
  // Toast Notifications
  // ============================================
  
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ============================================
  // Utility Functions
  // ============================================
  
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function log(message) {
    console.log(`[EmbeddedSDK Test] ${message}`);
  }

  // ============================================
  // Initialization
  // ============================================
  
  function init() {
    // Initialize theme
    initTheme();

    // Check if we're in an iframe
    const isInIframe = window.parent !== window;
    const hasOpener = window.opener !== null;
    
    if (!isInIframe && !hasOpener) {
      log('Not running in iframe or popup - parent communication limited');
      elements.iframeMode.textContent = 'standalone';
    } else {
      elements.iframeMode.textContent = isInIframe ? 'iframe' : 'popup';
    }

    // Set up event listeners
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Event buttons
    document.querySelectorAll('.btn-event').forEach(button => {
      button.addEventListener('click', () => {
        const eventName = button.dataset.event;
        handleEventButtonClick(eventName);
      });
    });

    // Log actions
    elements.clearLog.addEventListener('click', clearLog);
    elements.copyLog.addEventListener('click', copyLog);
    
    // Filter checkbox
    elements.filterUnknown.addEventListener('change', (e) => {
      state.filterUnknown = e.target.checked;
      rerenderLog();
    });

    // Custom payload send
    elements.sendCustom.addEventListener('click', handleSendCustom);

    // Listen for incoming messages
    window.addEventListener('message', handleIncomingMessage);

    // Token click to copy
    elements.dataToken.addEventListener('click', () => {
      if (state.merchantData?.token) {
        navigator.clipboard.writeText(state.merchantData.token).then(() => {
          showToast('Token copied to clipboard', 'success');
        });
      }
    });

    // Auto-initialize if in iframe
    if (isInIframe) {
      setTimeout(() => {
        log('Auto-sending iframe.loading event...');
        handleEventButtonClick('iframe.loading');
      }, 500);
    }

    log('Embedded SDK Test Console initialized');
  }

  // Start the app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

