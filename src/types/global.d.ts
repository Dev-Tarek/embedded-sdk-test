import type { EmbeddedApp } from "@salla.sa/embedded-sdk";

declare global {
  interface Window {
    salla: {
      embedded: EmbeddedApp;
    };
  }
}

export {};

