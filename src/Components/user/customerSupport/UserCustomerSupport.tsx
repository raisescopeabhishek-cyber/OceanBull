import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Copy,
  LifeBuoy,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  TicketPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { PageHeader } from "@/Components/ui";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const getTheme = (isDark: boolean) => ({
  pageText:"text-text",
  text:"text-text",
  muted:"text-subtle",
  softText:"text-muted",

  pageBg:"bg-surface",

  header:"border-line",

  headerText: "text-text",
  headerMuted: "text-muted",
  headerBadge: "border-line bg-surface-2 text-text",
  headerIcon: "border-line bg-surface-2 text-text",
  headerStat: "border-line bg-surface-2 text-text backdrop-blur-xl",
  headerStatMuted: "text-muted",

  card:"border-line bg-surface-2",

  cardSoft:"border-line bg-surface-2",

  iconBox:"border-line bg-primary-soft text-primary",

  badge:"border-line bg-surface-2 text-subtle",

  successBadge:"border-success bg-success-soft text-success",

  warningBadge:"border-line bg-primary-soft text-primary",

  button:"bg-primary text-text hover:bg-primary focus:ring-primary",

  outlineButton:"border-line bg-surface-2 text-muted hover:bg-surface-2",

  primarySoft:"border-line bg-primary-soft text-primary",
});

const HeaderCard = ({
  children,
  theme,
  isDark,
}: {
  children: React.ReactNode;
  theme: ReturnType<typeof getTheme>;
  isDark: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className={cx(
      "relative overflow-hidden rounded-card border p-5 transition-all duration-300 sm:p-6",
      theme.header
    )}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background: isDark
          ? "radial-gradient(circle at top left, rgba(79, 125, 246,0.20), transparent 36%), radial-gradient(circle at bottom right, rgba(34,211,238,0.10), transparent 32%)"
          : "radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 30%), radial-gradient(circle at bottom right, rgba(255,251,235,0.22), transparent 36%)",
      }}
    />
    <div className="relative z-[1]">{children}</div>
  </motion.div>
);

const Card = ({
  children,
  theme,
  className = "",
}: {
  children: React.ReactNode;
  theme: ReturnType<typeof getTheme>;
  className?: string;
}) => (
  <div
    className={cx(
      "rounded-card border p-4 transition-all duration-300 sm:p-5",
      theme.card,
      className
    )}
  >
    {children}
  </div>
);

const SoftCard = ({
  children,
  theme,
  className = "",
}: {
  children: React.ReactNode;
  theme: ReturnType<typeof getTheme>;
  className?: string;
}) => (
  <div className={cx("rounded-card border p-4", theme.cardSoft, className)}>
    {children}
  </div>
);

const HeaderIconBox = ({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: ReturnType<typeof getTheme>;
}) => (
  <div
    className={cx(
      "flex h-12 w-12 shrink-0 items-center justify-center rounded-card border",
      theme.headerIcon
    )}
  >
    {children}
  </div>
);

const IconBox = ({
  children,
  theme,
  className = "",
}: {
  children: React.ReactNode;
  theme: ReturnType<typeof getTheme>;
  className?: string;
}) => (
  <div
    className={cx(
      "flex h-11 w-11 shrink-0 items-center justify-center rounded-card border",
      theme.iconBox,
      className
    )}
  >
    {children}
  </div>
);

const HeaderStatBox = ({
  icon,
  label,
  value,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  theme: ReturnType<typeof getTheme>;
}) => (
  <div className={cx("rounded-card border px-4 py-3", theme.headerStat)}>
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-card border border-line bg-surface-2">
        {icon}
      </div>

      <div className="min-w-0">
        <p className={cx("text-xs", theme.headerStatMuted)}>{label}</p>
        <p className="mt-1 truncate text-base font-bold text-text">{value}</p>
      </div>
    </div>
  </div>
);

const InfoCard = ({
  theme,
  icon,
  title,
  subtitle,
  children,
}: {
  theme: ReturnType<typeof getTheme>;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) => (
  <SoftCard theme={theme}>
    <div className="flex items-start gap-3">
      <IconBox theme={theme} className="h-10 w-10 rounded-card">
        {icon}
      </IconBox>

      <div className="min-w-0 flex-1">
        <h3 className={cx("text-sm font-semibold", theme.text)}>{title}</h3>
        <p className={cx("mt-1 text-sm leading-6", theme.muted)}>{subtitle}</p>
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </div>
  </SoftCard>
);

export default function UserCustomerSupport() {
  const navigate = useNavigate();
  const mode = useSelector((store: any) => store.userTheme?.mode || "light");

  const isDark = mode === "dark";
  const theme = useMemo(() => getTheme(isDark), [isDark]);
  const email = useMemo(() => import.meta.env.VITE_EMAIL_EMAIL || "", []);

  const copyEmail = async () => {
    if (!email) return;

    try {
      await navigator.clipboard?.writeText(email);
    } catch {
      // Clipboard may be blocked in some browsers.
    }
  };

  const supportTips = [
    "Provide a clear issue summary",
    "Attach screenshots or exact error messages",
    "Mention your account/email/ID, but never passwords",
    "Add timestamps for time-sensitive issues",
    "List the steps you have already tried",
    "Mention browser, device, or platform details",
  ];

  return (
    <div
      className={cx(
        "w-full",
        theme.pageBg,
        theme.pageText
      )}
    >
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHeader
          breadcrumb="Support"
          title="Customer support"
          description="Get help with your account, wallet, banking and deposits."
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Card theme={theme} className="lg:col-span-4 xl:col-span-3">
            <div className="mb-5">
              <h2 className={cx("text-lg font-semibold", theme.text)}>
                Quick Support
              </h2>
              <p className={cx("mt-1 text-sm leading-6", theme.muted)}>
                Choose the best way to contact the support team.
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => navigate("/user/ticketDashboard")}
                className={cx(
                  "inline-flex w-full items-center justify-center gap-2 rounded-card px-5 py-3 text-sm font-bold outline-none transition focus:ring-4",
                  theme.button
                )}
              >
                <TicketPlus className="h-4 w-4" />
                Raise Ticket
              </button>

              <SoftCard theme={theme}>
                <div className="flex items-start gap-3">
                  <IconBox theme={theme} className="h-10 w-10 rounded-card">
                    <Mail className="h-5 w-5" />
                  </IconBox>

                  <div className="min-w-0 flex-1">
                    <p className={cx("text-sm font-semibold", theme.text)}>
                      Support Email
                    </p>
                    <p className="mt-1 truncate font-mono text-sm text-primary">
                      {email || "Not configured"}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <a
                        href={`mailto:${email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cx(
                          "inline-flex items-center justify-center rounded-card border px-3 py-2 text-xs font-semibold transition",
                          theme.primarySoft
                        )}
                      >
                        Write Email
                      </a>

                      <button
                        type="button"
                        onClick={copyEmail}
                        className={cx(
                          "inline-flex items-center justify-center gap-1.5 rounded-card border px-3 py-2 text-xs font-semibold transition",
                          theme.outlineButton
                        )}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </SoftCard>

              <InfoCard
                theme={theme}
                icon={<Clock className="h-5 w-5" />}
                title="Response Time"
                subtitle="Support is generally available Monday to Saturday, 8:00 AM – 8:00 PM."
              >
                <div
                  className={cx(
                    "rounded-card border px-3 py-2 text-xs",
                    theme.warningBadge
                  )}
                >
                  Typical first reply within 2–6 hours.
                </div>
              </InfoCard>

              <InfoCard
                theme={theme}
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Security Notice"
                subtitle="Our support team will never ask for your password, OTP, or private wallet keys."
              />
            </div>
          </Card>

          <Card theme={theme} className="lg:col-span-8 xl:col-span-9">
            <div className="mb-5 flex items-start gap-3">
              <IconBox theme={theme}>
                <LifeBuoy className="h-5 w-5" />
              </IconBox>

              <div>
                <h2 className={cx("text-lg font-semibold", theme.text)}>
                  How can we help?
                </h2>
                <p className={cx("mt-1 text-sm leading-6", theme.muted)}>
                  Use email for simple questions and ticket support for issues
                  that need tracking or attachments.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <SoftCard theme={theme} className="h-full">
                  <div className="flex h-full flex-col">
                    <div className="flex items-start gap-3">
                      <IconBox theme={theme} className="h-12 w-12">
                        <Mail className="h-6 w-6" />
                      </IconBox>

                      <div>
                        <h3
                          className={cx("text-lg font-semibold", theme.text)}
                        >
                          Email Support
                        </h3>
                        <p
                          className={cx(
                            "mt-2 text-sm leading-6",
                            theme.muted
                          )}
                        >
                          Best for simple account, wallet, or banking questions.
                          Include screenshots and short details for faster help.
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto pt-5">
                      <a
                        href={`mailto:${email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cx(
                          "inline-flex items-center justify-center gap-2 rounded-card px-5 py-3 text-sm font-bold transition",
                          theme.button
                        )}
                      >
                        <Send className="h-4 w-4" />
                        Send Email
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </SoftCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.06 }}
              >
                <SoftCard theme={theme} className="h-full">
                  <div className="flex h-full flex-col">
                    <div className="flex items-start gap-3">
                      <IconBox theme={theme} className="h-12 w-12">
                        <TicketPlus className="h-6 w-6" />
                      </IconBox>

                      <div>
                        <h3
                          className={cx("text-lg font-semibold", theme.text)}
                        >
                          Raise a Ticket
                        </h3>
                        <p
                          className={cx(
                            "mt-2 text-sm leading-6",
                            theme.muted
                          )}
                        >
                          Best for issues that need tracking, attachments, or
                          follow-up updates from the support team.
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto pt-5">
                      <button
                        type="button"
                        onClick={() => navigate("/user/ticketDashboard")}
                        className={cx(
                          "inline-flex items-center justify-center gap-2 rounded-card px-5 py-3 text-sm font-bold transition",
                          theme.button
                        )}
                      >
                        <TicketPlus className="h-4 w-4" />
                        Open Ticket Desk
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </SoftCard>
              </motion.div>
            </div>

            <div
              className={cx(
                "mt-5 rounded-card border p-4 sm:p-5",
                theme.cardSoft
              )}
            >
              <div className="mb-4 flex items-center gap-3">
                <IconBox theme={theme} className="h-10 w-10 rounded-card">
                  <ShieldCheck className="h-5 w-5" />
                </IconBox>

                <div>
                  <h3 className={cx("text-base font-semibold", theme.text)}>
                    How to get effective support
                  </h3>
                  <p className={cx("mt-1 text-sm", theme.muted)}>
                    Share the right details so your issue can be resolved
                    quickly.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {supportTips.map((tip) => (
                  <div
                    key={tip}
                    className={cx(
                      "flex items-start gap-3 rounded-card border px-4 py-3 text-sm",
                      theme.cardSoft
                    )}
                  >
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <span className={theme.softText}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <a
                href={`mailto:${email}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cx(
                  "inline-flex w-full items-center justify-center gap-2 rounded-card px-6 py-4 text-sm font-bold transition focus:ring-4",
                  theme.button
                )}
              >
                <Send className="h-5 w-5" />
                Send Support Email
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </Card>
        </div>

        <div className={cx("pb-4 text-center text-sm", theme.muted)}>
          We strive to provide helpful and transparent support for every user.
        </div>
      </div>
    </div>
  );
}