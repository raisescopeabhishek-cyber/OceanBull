import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { adminApi } from "../../../utils/apiClients";
import {
  Badge,
  Button,
  Field,
  FormPage,
  Input,
  Modal,
  SectionStep,
  Textarea,
} from "@/Components/ui";

/**
 * Custom email.
 *
 * The entry archetype. Who it goes to is step one, because that choice
 * changes what the rest of the form means — a single address sends the
 * rendered HTML, "all users" sends plain text through the bulk endpoint, and
 * the summary rail says which path a press of Send will take.
 *
 * The preview opens in a modal and renders the real HTML in an iframe, so
 * what is shown is what the recipient gets rather than an approximation.
 */

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
  body, html { margin:0; padding:0; font-family: Arial, sans-serif; line-height:1.6; color:#333; background:#f3f5f9; }
  .container { max-width:600px; margin:0 auto; padding:5px; background:#ffffff; }
  .header { background:#19422df2; color:#fff; padding:20px 15px; text-align:center; border-radius:10px 10px 0 0; }
  .header h1 { margin:0; font-size:22px; letter-spacing:0.5px; }
  .content { padding:12px 20px; }
  .footer { background:#19422df2; color:#fff; text-align:center; padding:10px; font-size:12px; border-radius:0 0 10px 10px; }
  .footer a { color:#bed2ff; text-decoration:none; }
  .cta-button { display:inline-block; padding:12px 24px; background:#0f9f6e; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold; margin:12px 0; }
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

  const recipientLabel =
    recipient === "single" ? email.trim() || "No address yet" : "Every user";

  return (
    <>
      <FormPage
        breadcrumb="Communications / Email"
        title="Custom email"
        description="Send a one-off message to a single client or to every user."
        actions={
          <Button
            variant="secondary"
            onClick={() => setShowPreview(true)}
            disabled={!subject.trim() && !message.trim()}
          >
            Preview
          </Button>
        }
        summary={{
          title: "Will send",
          rows: [
            {
              label: "To",
              value: recipientLabel,
              tone: recipient === "all" ? "loss" : "text",
            },
            { label: "Subject", value: subject.trim() || "—" },
            {
              label: "Body",
              value: `${message.trim().length} chars`,
            },
            {
              label: "Format",
              value: recipient === "single" ? "Branded HTML" : "Plain text",
              weight: "bold",
            },
          ],
          checks:
            recipient === "all"
              ? [
                  "Goes to every registered user — there is no undo.",
                  "Bulk sends use plain text, not the HTML template.",
                ]
              : ["Sent as the branded HTML template with the risk warning."],
        }}
        submit={{
          label: recipient === "all" ? "Send to all users" : "Send email",
          onClick: () => handleSubmit(),
          loading: isSending,
          disabled: isDisabled,
          tone: recipient === "all" ? "danger" : "primary",
          reason: isDisabled
            ? recipient === "single" && email.trim() && !isValidEmail(email)
              ? "That email address is not valid"
              : "Fill in the recipient, subject and message"
            : undefined,
        }}
      >
        <SectionStep
          index={1}
          title="Who receives it"
          hint="This changes both the endpoint and the format."
        >
          <div className="flex flex-wrap gap-2">
            <Button
              variant={recipient === "single" ? "primary" : "secondary"}
              onClick={() => setRecipient("single")}
            >
              One address
            </Button>
            <Button
              variant={recipient === "all" ? "danger" : "secondary"}
              onClick={() => setRecipient("all")}
            >
              All users
            </Button>
          </div>

          {recipient === "single" ? (
            <Field
              label="Email address"
              htmlFor="mail-to"
              className="mt-3"
              required
              error={
                email.trim() && !isValidEmail(email)
                  ? "That does not look like an email address"
                  : undefined
              }
            >
              <Input
                id="mail-to"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="numeric"
              />
            </Field>
          ) : (
            <div className="mt-3 rounded-field border border-danger/40 bg-danger-soft px-3 py-2.5">
              <Badge tone="danger" dot={false}>
                Bulk send
              </Badge>
              <p className="mt-1.5 text-xs text-danger">
                This reaches every registered user. Check the subject and body
                in the preview before sending.
              </p>
            </div>
          )}
        </SectionStep>

        <SectionStep
          index={2}
          title="Subject"
          hint="Also used as the heading inside the email."
        >
          <Field label="Subject line" htmlFor="mail-subject" required>
            <Input
              id="mail-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Scheduled maintenance this weekend"
            />
          </Field>
        </SectionStep>

        <SectionStep
          index={3}
          title="Message"
          hint="Line breaks are preserved. The risk warning is added for you."
        >
          <Field label="Body" htmlFor="mail-body" required>
            <Textarea
              id="mail-body"
              rows={10}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the message as you want it read."
            />
          </Field>

          {status === "success" ? (
            <p className="mt-2 text-xs font-medium text-profit">
              Sent. The form has been cleared.
            </p>
          ) : null}
        </SectionStep>
      </FormPage>

      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Email preview"
        size="lg"
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={recipient === "all" ? "danger" : "primary"} dot={false}>
              {recipient === "all" ? "All users" : recipientLabel}
            </Badge>
            <span className="text-xs text-subtle">
              {recipient === "single"
                ? "Rendered HTML, exactly as sent"
                : "Bulk sends deliver the plain text below, not this layout"}
            </span>
          </div>

          {/* An iframe so the email's own CSS cannot leak into the admin UI,
              and so what is shown is genuinely what is sent. */}
          <iframe
            title="Email preview"
            srcDoc={customContent}
            className="h-[60vh] w-full rounded-field border border-line bg-white"
            sandbox=""
          />
        </div>
      </Modal>
    </>
  );
}
