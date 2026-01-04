import { useState, useEffect, useCallback } from "react";
import { useTheme } from "./hooks/useTheme.js";
import { useEmbeddedSDK } from "./hooks/useEmbeddedSDK.js";
import { useBootstrap } from "./hooks/useBootstrap.js";
import { useMessageLog } from "./hooks/useMessageLog.js";
import { ToastProvider, useToast } from "./contexts/ToastContext.jsx";
import Header from "./components/Header.jsx";
import StatusBar from "./components/StatusBar.jsx";
import Tabs from "./components/Tabs.jsx";
import EventTriggers from "./components/EventTriggers.jsx";
import MessageLog from "./components/MessageLog.jsx";
import DataDisplay from "./components/DataDisplay.jsx";
import PayloadEditor from "./components/PayloadEditor.jsx";
import PlaygroundTab from "./components/Playground/PlaygroundTab.jsx";

function AppContent() {
  const { isDarkMode } = useTheme();
  const { embedded, layoutData, setLayoutData, init } = useEmbeddedSDK();
  const { showToast } = useToast();
  const {
    messageLog,
    filterUnknown,
    setFilterUnknown,
    logMessage,
    clearLog,
    copyLog,
  } = useMessageLog();

  const [isConnected, setIsConnected] = useState(false);
  const [parentOrigin, setParentOrigin] = useState(null);
  const [iframeMode, setIframeMode] = useState("standalone");
  const [activeTab, setActiveTab] = useState("test-console");

  // Handle layout update
  const handleLayoutUpdate = useCallback(
    (layout) => {
      setLayoutData(layout);
      if (layout.theme) {
        // Theme is handled by useTheme hook
      }
    },
    [setLayoutData]
  );

  // Handle verified data update
  const handleVerifiedDataUpdate = useCallback((data) => {
    // Data is already set in useBootstrap hook
  }, []);

  // Bootstrap flow
  const { token, verifiedData, verifyStatus, bootstrap } = useBootstrap(
    embedded,
    handleLayoutUpdate,
    handleVerifiedDataUpdate,
    showToast
  );

  // Handle incoming postMessage
  useEffect(() => {
    const handleIncomingMessage = (event) => {
      // Log all incoming messages
      logMessage("incoming", event.data, null, event.origin);

      if (event.origin && event.origin !== window.location.origin) {
        setParentOrigin(event.origin);
      }

      // Update connection status on first message
      if (!isConnected && event.data && event.data.event) {
        setIsConnected(true);
      }

      // Handle specific events
      if (!event.data || !event.data.event) return;

      switch (event.data.event) {
        case "embedded::context.provide":
          if (event.data.layout) {
            handleLayoutUpdate(event.data.layout);
            showToast("Connected! Received layout context.", "success");
          }
          break;

        case "embedded::theme.change":
          const theme = event.data.theme;
          if (theme) {
            // Theme change is handled by useTheme hook via URL or localStorage
            showToast("Theme changed by host: " + theme, "info");
          }
          break;

        case "embedded::nav.actionClick":
          showToast(
            `Action clicked! URL: ${event.data.url || "N/A"}, Value: ${event.data.value || "N/A"}`,
            "info"
          );
          logMessage("incoming", event.data);
          break;

        default:
          // Already logged above
          break;
      }
    };

    window.addEventListener("message", handleIncomingMessage);
    return () => window.removeEventListener("message", handleIncomingMessage);
  }, [isConnected, logMessage, showToast, handleLayoutUpdate]);

  // Detect iframe mode
  useEffect(() => {
    const isInIframe = window.parent !== window;
    const hasOpener = window.opener !== null;

    if (!isInIframe && !hasOpener) {
      setIframeMode("standalone");
    } else {
      setIframeMode(isInIframe ? "iframe" : "popup");
    }

    // Try to detect parent origin if same-origin
    if (isInIframe) {
      try {
        // If same-origin, we can access parent.location
        const parentOrigin = window.parent.location.origin;
        if (parentOrigin && parentOrigin !== window.location.origin) {
          setParentOrigin(parentOrigin);
        } else {
          // Fallback: will be updated when first message arrives
          setParentOrigin(window.location.origin + " (self)");
        }
      } catch (e) {
        // Cross-origin: can't access parent.location
        // Will be updated from postMessage event.origin
        setParentOrigin("—");
      }
    }

    // Auto-bootstrap if in iframe
    if (isInIframe) {
      setTimeout(() => {
        bootstrap();
      }, 500);
    }
  }, [bootstrap]);

  // Handle custom payload send
  const handleSendCustom = useCallback(
    (payload) => {
      const target = window.parent !== window ? window.parent : window.opener;

      if (!target || target === window) {
        showToast("No parent window detected. Open this page in an iframe.", "error");
        logMessage("outgoing", payload, "No parent window");
        return;
      }

      try {
        target.postMessage(payload, "*");
        logMessage("outgoing", payload);
      } catch (error) {
        showToast("Failed to send message: " + error.message, "error");
        logMessage("outgoing", payload, error.message);
      }
    },
    [showToast, logMessage]
  );

  // Handle copy log
  const handleCopyLog = useCallback(async () => {
    const success = await copyLog();
    if (success) {
      showToast("Log copied to clipboard", "success");
    } else {
      showToast("Failed to copy log", "error");
    }
  }, [copyLog, showToast]);

  const tabs = [
    { id: "test-console", label: "Test Console" },
    { id: "playground", label: "Playground" },
  ];

  return (
    <div className="app">
      <Header />
      <StatusBar
        isConnected={isConnected}
        parentOrigin={parentOrigin}
        iframeMode={iframeMode}
      />
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
      <main className="main-content">
        {activeTab === "test-console" ? (
          <>
            <EventTriggers
              embedded={embedded}
              logMessage={logMessage}
              showToast={showToast}
              bootstrap={bootstrap}
            />
            <div className="panel-right">
              <MessageLog
                messageLog={messageLog}
                filterUnknown={filterUnknown}
                onFilterChange={setFilterUnknown}
                onClear={clearLog}
                onCopy={handleCopyLog}
              />
              <DataDisplay
                layoutData={layoutData}
                token={token}
                verifiedData={verifiedData}
                verifyStatus={verifyStatus}
              />
              <PayloadEditor onSend={handleSendCustom} />
            </div>
          </>
        ) : (
          <PlaygroundTab embedded={embedded} logMessage={logMessage} showToast={showToast} />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
