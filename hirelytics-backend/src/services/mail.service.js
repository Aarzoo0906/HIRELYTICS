import nodemailer from "nodemailer";
import { ALLOWED_ADMIN_USERS } from "../config/adminUsers.js";

const primarySupportEmail =
  process.env.SUPPORT_EMAIL || "Hirelytics.support@gmail.com";
const developerEmails = ALLOWED_ADMIN_USERS.map((admin) => admin.email).filter(Boolean);

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const configuredCcEmails = (process.env.SUPPORT_CC_EMAILS || "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

const ccEmails = [...configuredCcEmails, ...developerEmails].filter(
  (email, index, emails) =>
    normalizeEmail(email) !== normalizeEmail(primarySupportEmail) &&
    emails.findIndex((candidate) => normalizeEmail(candidate) === normalizeEmail(email)) ===
      index,
);

const getRecipients = () => ({
  to: primarySupportEmail,
  cc: ccEmails,
});

const isMailConfigured = () =>
  Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const buildTransportOptions = (overrides = {}) => ({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(
    overrides.port ??
      process.env.SMTP_PORT ??
      (process.env.SMTP_SECURE === "true" ? 465 : 587),
  ),
  secure:
    typeof overrides.secure === "boolean"
      ? overrides.secure
      : process.env.SMTP_SECURE === "true",
  requireTLS:
    typeof overrides.secure === "boolean"
      ? !overrides.secure
      : process.env.SMTP_SECURE !== "true",
  connectionTimeout: 6500,
  greetingTimeout: 6500,
  socketTimeout: 9000,
  tls: {
    servername: process.env.SMTP_HOST || "smtp.gmail.com",
  },
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const createTransporter = (overrides = {}) =>
  nodemailer.createTransport(buildTransportOptions(overrides));

const escapeHtml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const sendSupportEmail = async ({
  name,
  email,
  subject,
  message,
  source = "Hirelytics settings",
}) => {
  if (!isMailConfigured()) {
    throw new Error(
      "Email service is not configured. Set SMTP credentials in the backend environment.",
    );
  }

  const recipients = getRecipients();
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
  const mailPayload = {
    from: `"Hirelytics Support" <${process.env.SMTP_USER}>`,
    to: recipients.to,
    ...(recipients.cc.length ? { cc: recipients.cc } : {}),
    replyTo: email,
    subject: `[Hirelytics] ${subject}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Source: ${source}`,
      "",
      "Message:",
      message,
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">New Hirelytics Support Message</h2>
        <p style="margin: 0 0 16px;">
          This message was submitted from <strong>${escapeHtml(source)}</strong>.
        </p>
        <table style="border-collapse: collapse; width: 100%; max-width: 720px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc; width: 180px;"><strong>Name</strong></td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Email</strong></td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${safeEmail}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Subject</strong></td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${safeSubject}</td>
          </tr>
        </table>
        <div style="padding: 16px; border: 1px solid #cbd5e1; border-radius: 12px; background: #ffffff;">
          <p style="margin-top: 0; font-weight: bold;">Message</p>
          <p style="margin-bottom: 0;">${safeMessage}</p>
        </div>
      </div>
    `,
  };

  try {
    await createTransporter().sendMail(mailPayload);
  } catch (error) {
    if (error?.code === "EAUTH") {
      throw new Error(
        "Gmail rejected the login for the support mailbox. Use a valid Gmail App Password in SMTP_PASS for Hirelytics.support@gmail.com.",
      );
    }

    const isTimeoutError =
      error?.code === "ETIMEDOUT" ||
      error?.code === "ESOCKET" ||
      `${error?.message || ""}`.toLowerCase().includes("timeout");

    if (isTimeoutError) {
      try {
        await createTransporter({ port: 465, secure: true }).sendMail(mailPayload);
        return {
          supportEmail: primarySupportEmail,
          developerEmails: ccEmails,
          deliveryProvider: "smtp",
        };
      } catch (fallbackError) {
        if (fallbackError?.code === "EAUTH") {
          throw new Error(
            "Gmail rejected the login for the support mailbox. Use a valid Gmail App Password in SMTP_PASS for Hirelytics.support@gmail.com.",
          );
        }

        throw new Error(
          "SMTP connection timed out on both Gmail ports 587 and 465. On Render, verify SMTP_HOST=smtp.gmail.com, use a fresh Gmail App Password in SMTP_PASS, and redeploy the backend.",
        );
      }
    }

    throw error;
  }

  return {
    supportEmail: primarySupportEmail,
    developerEmails: ccEmails,
    deliveryProvider: "smtp",
  };
};
