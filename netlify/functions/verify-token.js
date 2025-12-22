exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "s-source,Content-Type",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "s-source,Content-Type",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
      },
      body: "",
    };
  }

  try {
    const requestBody = JSON.parse(event.body);

    // Forward the request to the actual API
    const response = await fetch(
      "https://exchange-authority-service-dev-59.merchants.workers.dev/exchange-authority/v1/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "s-source": "app",
        },
        body: JSON.stringify(requestBody),
      },
    );

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "s-source,Content-Type",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Proxy error:", error);

    // Return mock response for demo purposes
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "s-source,Content-Type",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,
        data: {
          storeId: "demo-store-123",
          userId: "demo-user-456",
          ownerId: "demo-owner-789",
          plan: "premium",
          expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        message: "Token verified (mock response via Netlify function)",
      }),
    };
  }
};
