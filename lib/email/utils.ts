import { resend, EMAIL_FROM } from "@/lib/resend";
import { WelcomeEmail } from "@/components/emails/welcome-email";
import { VerificationEmail } from "@/components/emails/verification-email";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Welcome to OppsLab! 🚀",
      react: WelcomeEmail({ name, url: BASE_URL }),
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${BASE_URL}/auth/verify-request?token=${token}`; // Adjust based on NextAuth flow
  // Note: NextAuth usually handles verification emails internally via the 'email' provider 
  // with a custom sendVerificationRequest callback. 
  // This function is for custom verification flows if needed.
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Verify your email address",
      react: VerificationEmail({ url }),
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }
}
