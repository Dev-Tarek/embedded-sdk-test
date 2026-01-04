/**
 * Custom logger utility for the SDK test app
 * All logs are prefixed with [sdk-test]
 */
/* global console */

const PREFIX = "[sdk-test]";

/**
 * Format arguments for logging
 */
function formatArgs(...args) {
  return args.map((arg) => {
    if (typeof arg === "object" && arg !== null) {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (e) {
        return String(arg);
      }
    }
    return String(arg);
  });
}

/**
 * Custom logger with [sdk-test] prefix
 */
export const logger = {
  log: (...args) => {
    console.log(PREFIX, ...formatArgs(...args));
  },
  warn: (...args) => {
    console.warn(PREFIX, ...formatArgs(...args));
  },
  error: (...args) => {
    console.error(PREFIX, ...formatArgs(...args));
  },
  info: (...args) => {
    console.info(PREFIX, ...formatArgs(...args));
  },
  debug: (...args) => {
    console.debug(PREFIX, ...formatArgs(...args));
  },
};

export default logger;
