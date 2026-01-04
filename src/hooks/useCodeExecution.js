import { useState, useCallback } from "react";
/* global console */

export function useCodeExecution() {
  const [output, setOutput] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const executeCode = useCallback((code) => {
    setIsExecuting(true);
    setOutput([]);

    const logs = [];
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    };

    // Intercept all console methods
    console.log = (...args) => {
      logs.push({
        type: "log",
        args: args
          .map((a) =>
            typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
          )
          .join(" "),
      });
      originalConsole.log(...args);
    };

    console.error = (...args) => {
      logs.push({
        type: "error",
        args: args
          .map((a) =>
            typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
          )
          .join(" "),
      });
      originalConsole.error(...args);
    };

    console.warn = (...args) => {
      logs.push({
        type: "warn",
        args: args
          .map((a) =>
            typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
          )
          .join(" "),
      });
      originalConsole.warn(...args);
    };

    console.info = (...args) => {
      logs.push({
        type: "info",
        args: args
          .map((a) =>
            typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
          )
          .join(" "),
      });
      originalConsole.info(...args);
    };

    console.debug = (...args) => {
      logs.push({
        type: "debug",
        args: args
          .map((a) =>
            typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
          )
          .join(" "),
      });
      originalConsole.debug(...args);
    };

    const processResult = (result) => {
      // Restore console
      Object.assign(console, originalConsole);

      // Add result to output
      const newOutput = [...logs];
      if (result !== undefined) {
        newOutput.push({
          type: "result",
          args:
            typeof result === "object"
              ? JSON.stringify(result, null, 2)
              : String(result),
        });
      }

      setOutput(newOutput);
      setIsExecuting(false);
      return { result, logs, error: null };
    };

    const processError = (error) => {
      // Restore console
      Object.assign(console, originalConsole);

      const newOutput = [...logs, { type: "error", args: error.message }];
      setOutput(newOutput);
      setIsExecuting(false);
      return { result: null, logs, error: error.message };
    };

    try {
      // Execute code in current context
      const result = new Function(code)();

      // Handle promises (async code)
      if (result && typeof result.then === "function") {
        result
          .then((resolvedResult) => {
            processResult(resolvedResult);
          })
          .catch((error) => {
            processError(error);
          });
        // Don't restore console yet - wait for promise to resolve
        return { result: null, logs, error: null };
      } else {
        // Synchronous code - process immediately
        return processResult(result);
      }
    } catch (error) {
      return processError(error);
    }
  }, []);

  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  return {
    output,
    isExecuting,
    executeCode,
    clearOutput,
  };
}
