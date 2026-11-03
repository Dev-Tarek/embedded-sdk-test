/* global Response, URL */
/**
 * Cloudflare Worker - Static App + Token Verification
 *
 * Serves the built app from static assets and handles token verification
 * by proxying the request to the Salla exchange authority service.
 */

// One host for both environments; the `env` body field selects the backend
const VERIFY_API_URL = "https://api.salla.dev/exchange-authority/v1/verify";
const ENVIRONMENTS = ["prod", "dev"];

/**
 * Environments to try, in order. `ENV` pins one; unset or "auto" tries prod
 * first and falls back to dev only when prod can't decrypt the token, so one
 * deployment serves both the production and the dev merchant dashboard.
 */
function environmentsFor(env) {
  const pinned = env.ENV && env.ENV !== "auto" ? env.ENV : null;
  return pinned ? [pinned] : ENVIRONMENTS;
}

function isDecryptionFailure(status, result) {
  return status === 422 && result?.error?.message === "Decryption failed";
}

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

    const environments = environmentsFor(env);
    const invalid = environments.find((e) => !ENVIRONMENTS.includes(e));
    if (invalid) {
      return json(
        {
          success: false,
          error: `Invalid environment: ${invalid}. Must be 'dev', 'prod' or 'auto'`,
        },
        400,
      );
    }

    let response;
    let result;
    for (const environment of environments) {
      // Debug log request details
      console.log("Verifying token with Salla API", {
        apiUrl: VERIFY_API_URL,
        appId,
        token: token ? "[REDACTED]" : undefined,
        iss: iss || "merchant-dashboard",
        subject: subject || "embedded-page",
        env: environment,
      });

      // Make request to Salla API
      response = await fetch(VERIFY_API_URL, {
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

      result = await response.json();

      if (!isDecryptionFailure(response.status, result)) break;
    }

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
