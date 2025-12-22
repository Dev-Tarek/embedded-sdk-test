/**
 * Embedded SDK Test Console - Main Application
 *
 * This app demonstrates the embedded SDK flow:
 * 1. embedded.init() - get layout info
 * 2. embedded.auth.getToken() - get token from URL
 * 3. Verify token with backend API
 * 4. embedded.ready() or embedded.auth.error()
 */

/* eslint-env browser */
/* global window, document, localStorage, URLSearchParams, navigator, confirm, setTimeout, console, fetch */

import { embedded } from "@salla.sa/embedded-sdk";
import { EmbeddedEvents } from "./events.js";

(function () {
  "use strict";

  // ============================================
  // Constants
  // ============================================

  const VERIFY_API_URL =
    "https://exchange-authority-service-dev-59.merchants.workers.dev/exchange-authority/v1/verify";

  // ============================================
  // State
  // ============================================

  const state = {
    isConnected: false,
    parentOrigin: null,
    layoutData: null,
    verifiedData: null,
    token: null,
    messageLog: [],
    isDarkMode: localStorage.getItem("theme") === "dark",
    filterUnknown: true,
    isInitialized: false,
  };

  // ============================================
  // DOM Elements
  // ============================================

  const elements = {
    themeToggle: document.getElementById("theme-toggle"),
    connectionStatus: document.getElementById("connection-status"),
    parentOrigin: document.getElementById("parent-origin"),
    iframeMode: document.getElementById("iframe-mode"),
    messageLog: document.getElementById("message-log"),
    clearLog: document.getElementById("clear-log"),
    copyLog: document.getElementById("copy-log"),
    filterUnknown: document.getElementById("filter-unknown"),
    payloadEditor: document.getElementById("payload-editor"),
    sendCustom: document.getElementById("send-custom"),
    toastContainer: document.getElementById("toast-container"),

    // Data display elements
    dataTheme: document.getElementById("data-theme"),
    dataWidth: document.getElementById("data-width"),
    dataLocale: document.getElementById("data-locale"),
    dataCurrency: document.getElementById("data-currency"),
    dataToken: document.getElementById("data-token"),
    dataVerifyStatus: document.getElementById("data-verify-status"),
    dataStoreId: document.getElementById("data-store-id"),
    dataUserId: document.getElementById("data-user-id"),
    dataOwnerId: document.getElementById("data-owner-id"),
    dataExpiry: document.getElementById("data-expiry"),
  };

  // ============================================
  // Theme Management
  // ============================================

  function initTheme() {
    // Check URL params for dark mode
    const urlParams = new URLSearchParams(window.location.search);
    const darkParam = urlParams.get("dark");

    if (darkParam !== null) {
      state.isDarkMode = darkParam === "true" || darkParam === "1";
    }

    applyTheme();
  }

  function applyTheme() {
    document.documentElement.setAttribute(
      "data-theme",
      state.isDarkMode ? "dark" : "light",
    );
    localStorage.setItem("theme", state.isDarkMode ? "dark" : "light");
  }

  function toggleTheme() {
    state.isDarkMode = !state.isDarkMode;
    applyTheme();
    log("Theme changed to: " + (state.isDarkMode ? "dark" : "light"), "info");
  }

  // ============================================
  // Bootstrap Flow (New SDK Flow)
  // ============================================

  async function bootstrap() {
    log("Starting bootstrap flow...");

    try {
      // Step 1: Initialize SDK and get layout info
      showToast("Initializing SDK...", "info");
      const { layout } = await embedded.init({ debug: true });

      state.layoutData = layout;
      state.isInitialized = true;

      // Update layout display
      updateLayoutDisplay(layout);

      // Apply theme from host
      if (layout.theme) {
        state.isDarkMode = layout.theme === "dark";
        applyTheme();
      }

      log("SDK initialized. Layout: " + JSON.stringify(layout));
      setConnected(true); // Connected but parent origin will be set when first message received

      // Step 2: Get token from URL
      const token = embedded.auth.getToken();
      state.token = token;

      if (token) {
        elements.dataToken.textContent = maskToken(token);
        elements.dataToken.title = "Click to copy";
        log("Token found in URL");
      } else {
        log("No token found in URL", "warn");
        showToast("No token found in URL. Skipping verification.", "warning");
        // Signal ready anyway for testing
        embedded.ready();
        showToast("App ready (no token verification)", "success");
        return;
      }

      // Step 3: Verify token with backend API
      showToast("Verifying token...", "info");
      elements.dataVerifyStatus.textContent = "Verifying...";
      elements.dataVerifyStatus.className = "data-value";

      const verifyResult = await verifyToken(token);

      if (verifyResult.success) {
        // Step 4a: Token valid - signal ready
        state.verifiedData = verifyResult.data;
        displayVerifiedData(verifyResult.data);
        elements.dataVerifyStatus.textContent = "✓ Verified";
        elements.dataVerifyStatus.className = "data-value data-value-success";

        embedded.ready();
        showToast("Token verified! App is ready.", "success");
        log("Token verified. App ready signal sent.");
      } else {
        // Step 4b: Token invalid - signal error
        elements.dataVerifyStatus.textContent = "✗ Failed";
        elements.dataVerifyStatus.className = "data-value data-value-error";

        showToast("Token verification failed!", "error");
        log("Token verification failed", "error");

        // In a real app, we would call embedded.auth.error()
        // For testing, we don't auto-redirect
        // embedded.auth.error("Token verification failed");
      }
    } catch (err) {
      log("Bootstrap error: " + err.message, "error");
      showToast("Bootstrap failed: " + err.message, "error");

      // In a real app, signal error
      // embedded.auth.error(err.message);
    }
  }

  /**
   * Verify token with Salla API
   */
  async function verifyToken(token) {
    try {
      const response = await fetch(VERIFY_API_URL, {
        method: "POST",
        headers: {
          "s-source": "app",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          iss: "salla-partners",
          subject: "apps",
          env: "dev",
        }),
      });

      const result = await response.json();
      logMessage("incoming", {
        event: "token.verify.response",
        ...result,
      });

      return result;
    } catch (error) {
      log("Token verification error: " + error.message, "error");
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // PostMessage Communication
  // ============================================

  function sendMessage(eventData) {
    const target = window.parent !== window ? window.parent : window.opener;

    if (!target || target === window) {
      showToast(
        "No parent window detected. Open this page in an iframe.",
        "error",
      );
      logMessage("outgoing", eventData, "No parent window");
      return false;
    }

    try {
      target.postMessage(eventData, "*");
      logMessage("outgoing", eventData);
      return true;
    } catch (error) {
      showToast("Failed to send message: " + error.message, "error");
      logMessage("outgoing", eventData, error.message);
      return false;
    }
  }

  function handleIncomingMessage(event) {
    // Log all incoming messages
    logMessage("incoming", event.data, null, event.origin);

    // Update connection status on first message
    if (!state.isConnected && event.data && event.data.event) {
      setConnected(true, event.origin);
    }

    // Handle specific events
    if (!event.data || !event.data.event) return;

    switch (event.data.event) {
      case "embedded::context.provide":
        handleContextProvide(event.data);
        break;

      case "embedded::theme.change":
        handleThemeChange(event.data);
        break;

      case "embedded::nav.actionClick":
        handleNavActionClick(event.data);
        break;

      default:
        log("Received event: " + event.data.event);
    }
  }

  /**
   * Handle context.provide event (layout info)
   */
  function handleContextProvide(data) {
    if (data.layout) {
      state.layoutData = data.layout;
      updateLayoutDisplay(data.layout);

      if (data.layout.theme) {
        state.isDarkMode = data.layout.theme === "dark";
        applyTheme();
      }
    }

    showToast("Connected! Received layout context.", "success");
  }

  function handleThemeChange(data) {
    const theme = data.theme;
    if (theme) {
      state.isDarkMode = theme === "dark";
      applyTheme();
      if (elements.dataTheme) {
        elements.dataTheme.textContent = theme;
      }
      showToast("Theme changed by host: " + theme, "info");
    }
  }

  function handleNavActionClick(data) {
    showToast(
      `Action clicked! URL: ${data.url || "N/A"}, Value: ${data.value || "N/A"}`,
      "info",
    );
    log("Nav action triggered: " + JSON.stringify(data));
  }

  // ============================================
  // UI Updates
  // ============================================

  function setConnected(connected, origin = null) {
    state.isConnected = connected;
    state.parentOrigin = origin;

    elements.connectionStatus.className =
      "status-badge " +
      (connected ? "status-connected" : "status-disconnected");
    elements.connectionStatus.innerHTML =
      '<span class="status-dot"></span>' +
      (connected ? "Connected" : "Waiting for Parent");

    // Always show parent origin - use provided origin or show current window origin as fallback
    if (origin) {
      elements.parentOrigin.textContent = origin;
    } else if (connected && window.location.origin) {
      elements.parentOrigin.textContent = window.location.origin + " (self)";
    } else {
      elements.parentOrigin.textContent = "—";
    }
  }

  function updateLayoutDisplay(layout) {
    if (elements.dataTheme && layout.theme) {
      elements.dataTheme.textContent = layout.theme;
    }
    if (elements.dataWidth && layout.width) {
      elements.dataWidth.textContent = layout.width + "px";
    }
    if (elements.dataLocale && layout.locale) {
      elements.dataLocale.textContent = layout.locale;
    }
    if (elements.dataCurrency && layout.currency) {
      elements.dataCurrency.textContent = layout.currency;
    }
  }

  function displayVerifiedData(data) {
    if (elements.dataStoreId && data.store_id) {
      elements.dataStoreId.textContent = data.store_id;
    }
    if (elements.dataUserId && data.user_id) {
      elements.dataUserId.textContent = data.user_id;
    }
    if (elements.dataOwnerId && data.owner_id) {
      elements.dataOwnerId.textContent = data.owner_id;
    }
    if (elements.dataExpiry && data.exp) {
      elements.dataExpiry.textContent = data.exp;
    }
  }

  function maskToken(token) {
    if (!token || token.length < 20) return token;
    return token.substring(0, 10) + "..." + token.substring(token.length - 10);
  }

  // ============================================
  // Message Logging
  // ============================================

  function logMessage(direction, data, error = null, origin = null) {
    const entry = {
      time: new Date().toISOString(),
      direction,
      event: data?.event || "unknown",
      data,
      error,
      origin,
    };

    state.messageLog.push(entry);
    renderLogEntry(entry);
  }

  function renderLogEntry(entry) {
    if (state.filterUnknown && entry.event === "unknown") {
      return;
    }

    const emptyState = elements.messageLog.querySelector(".log-empty");
    if (emptyState) {
      emptyState.remove();
    }

    const div = document.createElement("div");
    div.className = "log-entry";
    div.dataset.event = entry.event;

    const time = new Date(entry.time);
    const timeStr = time.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });

    const directionIcon = entry.direction === "outgoing" ? "→" : "←";
    const directionClass = entry.direction;

    const displayEvent = entry.event.replace("embedded::", "");

    let dataStr = "";
    try {
      dataStr = JSON.stringify(entry.data, null, 0);
      if (dataStr.length > 80) {
        dataStr = dataStr.substring(0, 80) + "...";
      }
    } catch (e) {
      dataStr = String(entry.data);
    }

    div.innerHTML = `
      <span class="log-time">${timeStr}</span>
      <span class="log-direction ${directionClass}">${directionIcon}</span>
      <span class="log-event">${escapeHtml(displayEvent)}</span>
      <span class="log-data">${escapeHtml(dataStr)}</span>
    `;

    div.style.cursor = "pointer";
    div.addEventListener("click", () => {
      elements.payloadEditor.value = JSON.stringify(entry.data, null, 2);
      showToast("Payload copied to editor", "info");
    });

    elements.messageLog.appendChild(div);
    elements.messageLog.scrollTop = elements.messageLog.scrollHeight;
  }

  function rerenderLog() {
    elements.messageLog.innerHTML = "";
    state.messageLog.forEach((entry) => {
      renderLogEntry(entry);
    });

    if (elements.messageLog.children.length === 0) {
      elements.messageLog.innerHTML = `
        <div class="log-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <p>No messages yet</p>
          <span>Click "Init" to start communication</span>
        </div>`;
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
        <span>Click "Init" to start communication</span>
      </div>`;
    showToast("Log cleared", "info");
  }

  function copyLog() {
    const logText = state.messageLog
      .map((entry) => {
        return `[${entry.time}] ${entry.direction === "outgoing" ? "→" : "←"} ${entry.event}: ${JSON.stringify(entry.data)}`;
      })
      .join("\n");

    navigator.clipboard
      .writeText(logText)
      .then(() => {
        showToast("Log copied to clipboard", "success");
      })
      .catch(() => {
        showToast("Failed to copy log", "error");
      });
  }

  // ============================================
  // Event Handlers (SDK-based)
  // ============================================

  async function sendSdkEvent(eventName, payload) {
    logMessage("outgoing", payload);

    try {
      switch (eventName) {
        case "embedded::iframe.ready":
          // Use bootstrap flow instead
          await bootstrap();
          break;

        case "embedded::ready":
          embedded.ready();
          showToast("Ready signal sent!", "success");
          break;

        case "embedded::iframe.resize":
          embedded.page.resize(payload.height);
          break;

        case "embedded::auth.logout":
          embedded.auth.logout();
          break;

        case "embedded::auth.refresh":
          embedded.auth.refresh();
          break;

        case "embedded::auth.error":
          embedded.auth.error(payload.message);
          break;

        case "embedded::page.navigate":
          embedded.page.navigate(payload.path, {
            state: payload.state,
            replace: payload.replace,
          });
          break;

        case "embedded::page.redirect":
          embedded.page.redirect(payload.url);
          break;

        case "embedded::page.setTitle":
          embedded.page.setTitle(payload.title);
          break;

        case "embedded::nav.setAction":
          embedded.nav.setAction({
            title: payload.title,
            url: payload.url,
            value: payload.value,
            extendedActions: payload.extendedActions,
          });
          break;

        case "embedded::nav.clearAction":
          embedded.nav.clearAction();
          break;

        case "embedded::ui.loading-show":
          embedded.ui.loading.show(payload.mode);
          break;

        case "embedded::ui.loading-hide":
          embedded.ui.loading.hide();
          break;

        case "embedded::ui.overlay-open":
          embedded.ui.overlay.open();
          break;

        case "embedded::ui.overlay-close":
          embedded.ui.overlay.close();
          break;

        case "embedded::ui.toast-success":
          embedded.ui.toast.success(payload.message, payload.duration);
          break;

        case "embedded::ui.toast-error":
          embedded.ui.toast.error(payload.message, payload.duration);
          break;

        case "embedded::ui.toast-warning":
          embedded.ui.toast.warning(payload.message, payload.duration);
          break;

        case "embedded::ui.toast-info":
          embedded.ui.toast.info(payload.message, payload.duration);
          break;

        case "embedded::ui.modal-open":
          embedded.ui.modal.open(payload.id, payload.content);
          break;

        case "embedded::ui.modal-close":
          embedded.ui.modal.close(payload.id);
          break;

        case "embedded::ui.confirm": {
          showToast("Waiting for confirm dialog response...", "info");
          try {
            const result = await embedded.ui.confirm({
              title: payload.title,
              message: payload.message,
              confirmText: payload.confirmText,
              cancelText: payload.cancelText,
              variant: payload.variant,
            });
            showToast(
              `Confirm result: ${result.confirmed ? "✓ Confirmed" : "✗ Cancelled"}`,
              result.confirmed ? "success" : "info",
            );
            logMessage("incoming", {
              event: "embedded::ui.confirm.response",
              confirmed: result.confirmed,
            });
          } catch (error) {
            showToast(`Confirm error: ${error.message}`, "error");
          }
          break;
        }

        case "embedded::checkout.create":
          embedded.checkout.create(payload.payload);
          break;

        case "embedded::log":
          embedded.log(payload.level, payload.message, payload.context);
          break;

        default:
          showToast("No Embedded SDK handler for event: " + eventName, "error");
      }
    } catch (error) {
      showToast("Failed to send SDK event: " + error.message, "error");
      logMessage("outgoing", payload, error.message);
    }
  }

  async function handleEventButtonClick(eventName) {
    const eventDef = EmbeddedEvents[eventName];

    if (!eventDef) {
      showToast("Unknown event: " + eventName, "error");
      return;
    }

    if (eventDef.warning) {
      if (!confirm(eventDef.warning + "\n\nContinue?")) {
        return;
      }
    }

    let payload = JSON.parse(JSON.stringify(eventDef.payload));

    if (eventName === "embedded::iframe.ready") {
      payload.height = document.body.scrollHeight || 600;
    }

    elements.payloadEditor.value = JSON.stringify(payload, null, 2);

    await sendSdkEvent(eventName, payload);
  }

  function handleSendCustom() {
    try {
      const payload = JSON.parse(elements.payloadEditor.value);
      sendMessage(payload);
    } catch (error) {
      showToast("Invalid JSON: " + error.message, "error");
    }
  }

  // ============================================
  // Toast Notifications
  // ============================================

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.textContent = message;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ============================================
  // Utility Functions
  // ============================================

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function log(message, level = "info") {
    const prefix = "[EmbeddedSDK Test]";
    if (level === "error") {
      console.error(`${prefix} ${message}`);
    } else if (level === "warn") {
      console.warn(`${prefix} ${message}`);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  // ============================================
  // Initialization
  // ============================================

  function init() {
    initTheme();

    const isInIframe = window.parent !== window;
    const hasOpener = window.opener !== null;

    if (!isInIframe && !hasOpener) {
      log("Not running in iframe or popup - parent communication limited");
      elements.iframeMode.textContent = "standalone";
    } else {
      elements.iframeMode.textContent = isInIframe ? "iframe" : "popup";
    }

    // Set up event listeners
    elements.themeToggle.addEventListener("click", toggleTheme);

    document.querySelectorAll(".btn-event").forEach((button) => {
      button.addEventListener("click", () => {
        const eventName = button.dataset.event;
        handleEventButtonClick(eventName);
      });
    });

    elements.clearLog.addEventListener("click", clearLog);
    elements.copyLog.addEventListener("click", copyLog);

    elements.filterUnknown.addEventListener("change", (e) => {
      state.filterUnknown = e.target.checked;
      rerenderLog();
    });

    elements.sendCustom.addEventListener("click", handleSendCustom);

    window.addEventListener("message", handleIncomingMessage);

    if (elements.dataToken) {
      elements.dataToken.addEventListener("click", () => {
        if (state.token) {
          navigator.clipboard.writeText(state.token).then(() => {
            showToast("Token copied to clipboard", "success");
          });
        }
      });
    }

    // Auto-bootstrap if in iframe
    if (isInIframe) {
      setTimeout(() => {
        log("Auto-starting bootstrap flow...");
        bootstrap();
      }, 500);
    }

    log("Embedded SDK Test Console initialized");
  }

  // Start the app
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
