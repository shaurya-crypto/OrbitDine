const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "hello@orbitdine.com";
const SENDER_NAME = process.env.BREVO_SENDER_NAME || "OrbitDine";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface EmailRecipient {
  email: string;
  name?: string;
}

async function sendBrevoEmail(to: EmailRecipient[], subject: string, htmlContent: string) {
  if (!BREVO_API_KEY) {
    console.warn("BREVO_API_KEY is not set. Skipping email send.");
    return false;
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to,
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Brevo API error:", errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send email via Brevo:", error);
    return false;
  }
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyLink = `${APP_URL}/verify-email?token=${token}`;
  
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to OrbitDine, ${name}!</h2>
      <p style="color: #555; font-size: 16px;">
        Please verify your email address by clicking the link below:
      </p>
      <a href="${verifyLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; margin-top: 16px;">
        Verify Email Address
      </a>
      <p style="color: #777; font-size: 14px; margin-top: 24px;">
        If you did not request this, please ignore this email.
      </p>
    </div>
  `;

  return sendBrevoEmail([{ email, name }], "Verify your OrbitDine account", htmlContent);
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetLink = `${APP_URL}/reset-password?token=${token}`;
  
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p style="color: #555; font-size: 16px;">
        Hello ${name}, we received a request to reset your OrbitDine password.
      </p>
      <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; margin-top: 16px;">
        Reset Password
      </a>
      <p style="color: #777; font-size: 14px; margin-top: 24px;">
        This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  return sendBrevoEmail([{ email, name }], "Reset your OrbitDine password", htmlContent);
}

export async function sendWelcomeEmail(email: string, name: string) {
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to OrbitDine!</h2>
      <p style="color: #555; font-size: 16px;">
        Hi ${name}, we're thrilled to have you on board.
      </p>
      <p style="color: #555; font-size: 16px;">
        OrbitDine is your complete OS for managing orders, tables, and analytics. Log in to your dashboard to finish setting up your restaurant.
      </p>
      <a href="${APP_URL}/login" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; margin-top: 16px;">
        Go to Dashboard
      </a>
    </div>
  `;

  return sendBrevoEmail([{ email, name }], "Welcome to OrbitDine!", htmlContent);
}

export async function sendManagerInvitationEmail(email: string, inviterName: string, restaurantName: string, token: string) {
  const signupLink = `${APP_URL}/signup/manager?token=${token}`;
  
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">You've been invited!</h2>
      <p style="color: #555; font-size: 16px;">
        ${inviterName} has invited you to join <strong>${restaurantName}</strong> as a Manager on OrbitDine.
      </p>
      <a href="${signupLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; margin-top: 16px;">
        Accept Invitation
      </a>
    </div>
  `;

  return sendBrevoEmail([{ email }], `Invitation to join ${restaurantName} on OrbitDine`, htmlContent);
}
