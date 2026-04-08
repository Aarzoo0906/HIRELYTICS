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

const createTransporter = () =>
  nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || "gmail",
    secure: process.env.SMTP_SECURE === "true",
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
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

export const sendSupportEmail = async ({
  name,
  email,
  subject,
  message,
  source = "Hirelytics settings",
}) => {
  if (!isMailConfigured()) {
    throw new Error(
      "Email service is not configured. Set SMTP_USER and SMTP_PASS in the backend .env file.",
    );
  }

  const transporter = createTransporter();
  const recipients = getRecipients();
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  try {
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

    throw error;
  }

  return {
    supportEmail: primarySupportEmail,
    developerEmails: ccEmails,
  };
};
