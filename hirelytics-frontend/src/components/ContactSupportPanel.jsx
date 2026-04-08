import { useEffect, useState } from "react";
import { CheckCircle2, Copy, LoaderCircle, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE, fetchJson } from "../lib/api";

const supportEmail = "Hirelytics.support@gmail.com";
const isValidEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const ContactSupportPanel = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [mailStatus, setMailStatus] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      name: current.name || user?.name || "",
      email: current.email || user?.email || "",
    }));
  }, [user?.email, user?.name]);

  const handleChange = (field) => (event) => {
    setFormData((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setMailStatus({
        type: "error",
        message: "Please fill in your name, email, subject, and message.",
      });
      return;
    }

    if (!isValidEmail(formData.email)) {
      setMailStatus({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setIsSending(true);
    setMailStatus({ type: "", message: "" });

    try {
      const data = await fetchJson(`${API_BASE}/contact/support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          source: "Hirelytics settings contact section",
        }),
      }, 16000);

      if (!data.success) {
        throw new Error(data.message || "Unable to send the support email.");
      }

      setMailStatus({
        type: "success",
        message: `Your email was sent successfully to ${supportEmail}.`,
      });
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setMailStatus({
        type: "error",
        message:
          error.message ||
          "Unable to send the support email right now. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const copyDeveloperEmails = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setMailStatus({
        type: "success",
        message: "Support email address copied to your clipboard.",
      });
    } catch {
      setMailStatus({
        type: "error",
        message: `Copy failed. Please email ${supportEmail} manually.`,
      });
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-600 dark:text-teal-300">
            Contact Us
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            Send a message directly to Hirelytics support
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            This form sends your message from the app directly to the Hirelytics
            support inbox.
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Recipient: {supportEmail}
          </p>
        </div>
        <button
          type="button"
          onClick={copyDeveloperEmails}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          aria-label="Copy support and developer email addresses"
        >
          <Copy size={15} />
          Copy Email
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Your Name
          </span>
          <input
            type="text"
            value={formData.name}
            onChange={handleChange("name")}
            placeholder="Enter your name"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Your Email
          </span>
          <input
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            placeholder="Enter your email"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            required
          />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Subject
          </span>
          <input
            type="text"
            value={formData.subject}
            onChange={handleChange("subject")}
            placeholder="What do you need help with?"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            required
          />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Message
          </span>
          <textarea
            value={formData.message}
            onChange={handleChange("message")}
            placeholder="Write your message for the Hirelytics team."
            rows={5}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            required
          />
        </label>

        <div className="md:col-span-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The submitted email will be delivered by the backend service, not by
            the user&apos;s local mail app.
          </p>
          <button
            type="submit"
            disabled={
              isSending ||
              !formData.name.trim() ||
              !formData.email.trim() ||
              !formData.subject.trim() ||
              !formData.message.trim()
            }
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 px-5 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSending ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
            {isSending ? "Sending Email..." : "Send Email"}
          </button>
        </div>
      </form>

      {mailStatus.message ? (
        <div
          className={`mt-5 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${
            mailStatus.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
              : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300"
          }`}
        >
          <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
          <p>{mailStatus.message}</p>
        </div>
      ) : null}
    </section>
  );
};

export default ContactSupportPanel;
