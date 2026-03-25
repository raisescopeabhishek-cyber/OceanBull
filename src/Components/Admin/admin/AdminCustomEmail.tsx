// AdminCustomEmail.tsx
import React, { useMemo, useState } from "react";
import {
  Mail,
  Send,
  User,
  UsersRound,
  AlertTriangle,
  CheckCircle,
  Hash,
  AtSign,
  Eye,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../../utils/apiClients";

// ✨ ambient visuals (shared theme)
import { FloatingParticles } from "../../../utils/FloatingParticles";
import { AnimatedGrid } from "../../../utils/AnimatedGrid";

export default function AdminCustomEmail() {
  const [recipient, setRecipient] = useState<"single" | "all">("single");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  // Build the HTML content (keeps your original content + vibe)
  const customContent = useMemo(
    () => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${subject || "Message"} - ${import.meta.env.VITE_WEBSITE_NAME || ""}</title>
<style>
  body, html { margin:0; padding:0; font-family: Arial, sans-serif; line-height:1.6; color:#333; background:#f4f4f4; }
  .container { max-width:600px; margin:0 auto; padding:5px; background:#ffffff; }
  .header { background:#19422df2; color:#fff; padding:20px 15px; text-align:center; border-radius:10px 10px 0 0; }
  .header h1 { margin:0; font-size:22px; letter-spacing:0.5px; }
  .content { padding:12px 20px; }
  .footer { background:#19422df2; color:#fff; text-align:center; padding:10px; font-size:12px; border-radius:0 0 10px 10px; }
  .footer a { color:#B6D0E2; text-decoration:none; }
  .cta-button { display:inline-block; padding:12px 24px; background:#2d6a4f; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold; margin:12px 0; }
  .risk-warning { color:#C70039; padding:6px 0; font-size:12px; line-height:1.45; }
  .hr { border:none; border-top:1px solid #eee; margin:14px 0; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${subject || "Priority Update"}</h1>
    </div>
    <div class="content">
      <p>${(message || "").replace(/\n/g, "<br/>")}</p>
      <p>Best regards,<br>${import.meta.env.VITE_WEBSITE_NAME || "Our"} Team</p>
      <div class="hr"></div>
      <div class="risk-warning">
        <strong>Risk Warning:</strong> Trading CFDs carries high risk and may result in losses beyond your initial investment. Trade only with money you can afford to lose and understand the risks.<br/><br/>
        ${import.meta.env.VITE_WEBSITE_NAME || ""} services are not for U.S. citizens or in jurisdictions where they violate local laws.
      </div>
    </div>
    <div class="footer">
      <p>Website: <a href="https://${import.meta.env.VITE_EMAIL_WEBSITE || ""}">${import.meta.env.VITE_EMAIL_WEBSITE || ""}</a> 
      | E-mail: <a href="mailto:${import.meta.env.VITE_EMAIL_EMAIL || ""}">${import.meta.env.VITE_EMAIL_EMAIL || ""}</a></p>
      <p>© ${new Date().getFullYear()} ${import.meta.env.VITE_WEBSITE_NAME || ""}. All Rights Reserved</p>
    </div>
  </div>
</body>
</html>`,
    [message, subject]
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // validation
    if (!subject.trim() || !message.trim() || (recipient === "single" && !email.trim())) {
      setStatus("error");
      toast.error("Please fill all required fields.");
      return;
    }
    if (recipient === "single" && !isValidEmail(email)) {
      setStatus("error");
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSending(true);
    try {
      if (recipient === "single") {
        const toastId = toast.loading("Sending email…");
        await adminApi.post(`/custom-mail`, {
          email: email.trim(),
          content: customContent,
          subject: subject.trim(),
        });
        toast.success("Email sent", { id: toastId });
      } else {
        // all users
        toast.success(
          "Bulk send started. It may take a bit depending on user count.",
          { duration: 5000 }
        );
        await adminApi.post(`/send-emails`, {
          text: message.trim(),
          subject: subject.trim(),
        });
      }

      setStatus("success");
      setEmail("");
      setSubject("");
      setMessage("");
      setTimeout(() => setStatus(null), 2500);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
      setStatus("error");
    } finally {
      setIsSending(false);
    }
  };

  const isDisabled =
    isSending ||
    !subject.trim() ||
    !message.trim() ||
    (recipient === "single" && (!email.trim() || !isValidEmail(email)));

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <AnimatedGrid />
      <FloatingParticles />

      <div className="max-w-5xl mx-auto pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                Custom Email
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-600/50 text-slate-200 hover:bg-slate-800/60 transition-all"
              title="Preview email"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Recipient toggle */}
            <div className="inline-flex bg-slate-900/40 border border-slate-700/60 rounded-full p-1">
              <button
                type="button"
                onClick={() => setRecipient("single")}
                className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm transition-all ${
                  recipient === "single"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <User className="w-4 h-4" /> Single User
              </button>
              <button
                type="button"
                onClick={() => setRecipient("all")}
                className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm transition-all ${
                  recipient === "all"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <UsersRound className="w-4 h-4" /> All Users
              </button>
            </div>

            {/* Email (if single) */}
            {recipient === "single" && (
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Recipient email"
                  className="w-full bg-slate-900/50 border border-slate-700/60 rounded-2xl px-12 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              </div>
            )}

            {/* Subject */}
            <div className="relative">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="w-full bg-slate-900/50 border border-slate-700/60 rounded-2xl px-12 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              />
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            </div>

            {/* Message */}
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose your message…"
                className="w-full h-52 bg-slate-900/50 border border-slate-700/60 rounded-2xl px-12 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-none"
              />
              <Send className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
            </div>

            {/* Status banners */}
            {status === "error" && (
              <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl">
                <AlertTriangle className="w-4 h-4" />
                <span>Something went wrong. Check fields and try again.</span>
              </div>
            )}
            {status === "success" && (
              <div className="flex items-center gap-2 text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-xl">
                <CheckCircle className="w-4 h-4" />
                <span>Email sent successfully!</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="submit"
                disabled={isDisabled}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold transition-all ${
                  isDisabled
                    ? "bg-slate-700/60 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/10"
                }`}
              >
                <Send className="w-5 h-5" />
                {isSending ? "Sending…" : "Send Email"}
              </button>

              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-slate-600/50 text-slate-200 hover:bg-slate-800/60 transition-all"
              >
                <Eye className="w-5 h-5" />
                Preview
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl h-[80vh] bg-slate-900/90 border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 text-slate-300 hover:text-white z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="h-full">
              <iframe
                title="Email Preview"
                className="w-full h-full bg-white"
                srcDoc={customContent}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
