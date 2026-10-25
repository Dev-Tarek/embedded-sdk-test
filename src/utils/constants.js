// Token verification is handled by the Cloudflare Worker (server/worker.js)
export const VERIFY_FUNCTION_URL = "/api/verify-token";

// App ID - can be overridden via URL parameter ?appId=XXX
export function getAppId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("app_id");
}
