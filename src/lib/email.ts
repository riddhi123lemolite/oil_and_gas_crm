/**
 * Real email sending via EmailJS (https://www.emailjs.com).
 *
 * Because this CRM is a static, backend-free app, it cannot send email on its
 * own. EmailJS delivers mail straight from the browser using YOUR connected
 * mailbox (Gmail/Outlook/etc.), so no server is required.
 *
 * Setup (one time):
 *   1. Create a free account at https://www.emailjs.com
 *   2. Add an Email Service (connect your Gmail/Outlook) → note the Service ID.
 *   3. Create an Email Template with these variables in it:
 *        {{to_email}}  {{subject}}  {{message}}  {{from_name}}
 *      and set the template's "To email" field to {{to_email}}.
 *      Note the Template ID.
 *   4. Copy your Public Key (Account → General).
 *   5. Put all three in your environment (.env.local, or Vercel project vars):
 *        NEXT_PUBLIC_EMAILJS_SERVICE_ID=...
 *        NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=...
 *        NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=...
 */

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string | undefined;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string | undefined;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string | undefined;

/** True when all EmailJS credentials are present, so real sending is possible. */
export const emailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

export interface SendEmailInput {
  to: string;
  subject: string;
  message: string;
  fromName?: string;
}

/**
 * Sends a real email through EmailJS. Throws on failure with a readable message.
 * Callers should check {@link emailConfigured} first to decide whether to fall
 * back to demo behaviour.
 */
export async function sendEmail({
  to,
  subject,
  message,
  fromName = 'OilGas CRM Sales Team',
}: SendEmailInput): Promise<void> {
  if (!emailConfigured) {
    throw new Error('Email is not configured. Add EmailJS keys to enable sending.');
  }

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: PUBLIC_KEY,
      template_params: {
        to_email: to,
        subject,
        message,
        from_name: fromName,
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(detail || `Email service returned ${res.status}`);
  }
}

/**
 * Zero-setup fallback: opens the user's own email app (Gmail, Outlook, Apple
 * Mail, etc.) with the recipient, subject, and body pre-filled via a `mailto:`
 * link. The user just presses send. Works with no accounts or API keys.
 */
export function openMailClient({ to, subject, message }: SendEmailInput): void {
  const url =
    `mailto:${encodeURIComponent(to)}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(message)}`;
  window.location.href = url;
}
