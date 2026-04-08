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

const isResendConfigured = () => Boolean(process.env.RESEND_API_KEY);

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || (process.env.SMTP_SECURE === "true" ? 465 : 587)),
    secure: process.env.SMTP_SECURE === "true",
    requireTLS: process.env.SMTP_SECURE !== "true",
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 20000,
    tls: {
      servername: process.env.SMTP_HOST || "smtp.gmail.com",
    },
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const escapeHtml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sendWithResendApi = async ({
  name,
  email,
  subject,
  message,
  source,
  recipients,
  safeName,
  safeEmail,
  safeSubject,
  safeMessage,
}) => {
  const fromAddress =
    process.env.RESEND_FROM_EMAIL ||
    process.env.SMTP_USER ||
    "onboarding@resend.dev";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `Hirelytics Support <${fromAddress}>`,
      to: [recipients.to],
      ...(recipients.cc.length ? { cc: recipients.cc } : {}),
      reply_to: email,
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
    }),
  });

  const raw = await response.text();
  let data = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { message: raw };
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Resend API request failed with status ${response.status}`,
    );
  }
};

export const sendSupportEmail = async ({
  name,
  email,
  subject,
  message,
  source = "Hirelytics settings",
}) => {
  if (!isResendConfigured() && !isMailConfigured()) {
    throw new Error(
      "Email service is not configured. Set RESEND_API_KEY or SMTP credentials in the backend environment.",
    );
  }

  const recipients = getRecipients();
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  try {
    if (isResendConfigured()) {
      await sendWithResendApi({
        name,
        email,
        subject,
        message,
        source,
        recipients,
        safeName,
        safeEmail,
        safeSubject,
        safeMessage,
      });

      return {
        supportEmail: primarySupportEmail,
        developerEmails: ccEmails,
        deliveryProvider: "resend",
      };
    }

    const transporter = createTransporter();

    await transporter.sendMail({
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
    });
  } catch (error) {
    if (error?.code === "EAUTH") {
      throw new Error(
        "Gmail rejected the login for the support mailbox. Use a valid Gmail App Password in SMTP_PASS for Hirelytics.support@gmail.com.",
      );
    }

    if (
      error?.code === "ETIMEDOUT" ||
      error?.code === "ESOCKET" ||
      `${error?.message || ""}`.toLowerCase().includes("timeout")
    ) {
      throw new Error(
        "SMTP connection timed out. On Render, set SMTP_HOST=smtp.gmail.com, SMTP_PORT=587, SMTP_SECURE=false, and use a valid Gmail App Password in SMTP_PASS.",
      );
    }

    throw error;
  }

  return {
    supportEmail: primarySupportEmail,
    developerEmails: ccEmails,
    deliveryProvider: "smtp",
  };
};
