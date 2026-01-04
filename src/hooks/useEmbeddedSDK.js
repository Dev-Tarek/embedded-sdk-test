import { useState, useEffect, useCallback } from "react";
import { embedded } from "@salla.sa/embedded-sdk";

export function useEmbeddedSDK() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [layoutData, setLayoutData] = useState(null);

  // Expose embedded globally for playground
  useEffect(() => {
    if (!window.salla) {
      window.salla = {};
    }
    window.salla.embedded = embedded;
  }, []);

  const init = useCallback(async (options = { debug: true }) => {
    try {
      const { layout } = await embedded.init(options);
      setLayoutData(layout);
      setIsInitialized(true);
      return { layout };
    } catch (error) {
      console.error("SDK initialization error:", error);
      throw error;
    }
  }, []);

  return {
    embedded,
    isInitialized,
    layoutData,
    setLayoutData,
    init,
  };
}

