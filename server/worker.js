/* global Response, URL */
/**
 * Cloudflare Worker - Static App + Token Verification
 *
 * Serves the built app from static assets and handles token verification
 * by proxying the request to the Salla exchange authority service.
 */

// Same host for both environments; the `env` body field selects the backend
const VERIFY_API_URLS = {
  dev: "https://api.salla.dev/exchange-authority/v1/verify",
  prod: "https://api.salla.dev/exchange-authority/v1/verify",
};

const jsonHeaders = { "Content-Type": "application/json" };

function json(body, status, headers = jsonHeaders) {
  return new Response(JSON.stringify(body), { status, headers });
}

async function handleVerifyToken(request, env) {
  // Only allow POST requests
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    // Parse request body
    const body = JSON.parse((await request.text()) || "{}");
    const { token, iss, subject, appId } = body;

    // Validate required fields
    if (!token) {
      return json({ success: false, error: "Token is required" }, 400);
    }

    // Validate app ID
    if (!appId) {
      return json({ success: false, error: "App ID is required" }, 400);
    }

    // Determine environment (default to 'dev' when ENV is not set)
    const environment = env.ENV || "dev";

    // Get API URL based on environment
    const apiUrl = VERIFY_API_URLS[environment];
    if (!apiUrl) {
      return json(
        {
          success: false,
          error: `Invalid environment: ${environment}. Must be 'dev' or 'prod'`,
        },
        400,
      );
    }

    // Debug log request details
    console.log("Verifying token with Salla API", {
      apiUrl: apiUrl,
      appId,
      token: token ? "[REDACTED]" : undefined,
      iss: iss || "merchant-dashboard",
      subject: subject || "embedded-page",
      env: environment,
    });

    // Make request to Salla API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "s-source": appId, // APP ID (dynamic)
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        iss: iss || "merchant-dashboard",
        subject: subject || "embedded-page",
        env: environment,
      }),
    });

    // Debug log response status
    console.log("Salla API response status:", response.status);

    const result = await response.json();

    // Return the result with appropriate status code
    return json(result, response.status, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // Allow CORS
      "Access-Control-Allow-Headers": "Content-Type",
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return json(
      { success: false, error: error.message || "Internal server error" },
      500,
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/verify-token") {
      return handleVerifyToken(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
