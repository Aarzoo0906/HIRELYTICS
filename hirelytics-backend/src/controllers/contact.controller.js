import { sendSupportEmail } from "../services/mail.service.js";

const isValidEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const sendSupportRequest = async (req, res) => {
  try {
    const {
      name = "",
      email = "",
      subject = "",
      message = "",
      source = "Hirelytics settings",
    } = req.body || {};

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and message are required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    await sendSupportEmail({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      source: source.trim() || "Hirelytics settings",
    });

    return res.status(200).json({
      success: true,
      message: "Your message was sent to the Hirelytics support and developer team.",
    });
  } catch (error) {
    console.error("Send support request error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to send the support email right now.",
    });
  }
};
