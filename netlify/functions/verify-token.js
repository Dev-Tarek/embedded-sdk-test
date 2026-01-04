/**
 * Netlify Serverless Function - Token Verification
 *
 * This function handles token verification by proxying the request
 * to the Salla exchange authority service.
 */

// Environment-based API URLs (base64 encoded)
const VERIFY_API_URLS = {
  dev: "aHR0cHM6Ly9leGNoYW5nZS1hdXRob3JpdHktc2VydmljZS1kZXYtNTkubWVyY2hhbnRzLndvcmtlcnMuZGV2L2V4Y2hhbmdlLWF1dGhvcml0eS92MS92ZXJpZnk",
  prod: "aHR0cHM6Ly9hcGkuc2FsbGEuZGV2L2V4Y2hhbmdlLWF1dGhvcml0eS92MS92ZXJpZnk=",
};

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || "{}");
    const { token, iss, subject, env, appId } = body;

    // Validate required fields
    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Token is required" }),
      };
    }

    // Validate app ID
    if (!appId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "App ID is required" }),
      };
    }

    // Determine environment (default to 'dev')
    const environment = env || "dev";

    // Get API URL based on environment
    const apiUrl = VERIFY_API_URLS[environment];
    if (!apiUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: `Invalid environment: ${environment}. Must be 'dev' or 'prod'`,
        }),
      };
    }

    // Make request to Salla API
    const response = await fetch(atob(apiUrl), {
      method: "POST",
      headers: {
        "s-source": appId, // APP ID (dynamic)
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        iss: iss || "merchant-dashboard",
        subject: subject || "embedded-page",
        env: env || "dev",
      }),
    });

    const result = await response.json();

    // Return the result with appropriate status code
    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow CORS
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
    };
  }
};
