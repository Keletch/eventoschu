"use server";

/**
 * Validates the Turnstile token with Cloudflare's API.
 * This happens on the server to keep the Secret Key secure.
 */
export async function validateTurnstileToken(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is missing");
    return { success: false, error: "Server configuration error" };
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
      }
    );

    const outcome = await response.json();
    
    if (outcome.success) {
      return { success: true };
    } else {
      return { success: false, error: "Verificación de seguridad fallida" };
    }
  } catch (error) {
    console.error("Turnstile Error:", error);
    return { success: false, error: "Error de red en la verificación" };
  }
}
