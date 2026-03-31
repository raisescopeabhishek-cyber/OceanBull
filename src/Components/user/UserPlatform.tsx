import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Monitor,
  Smartphone,
  AppleIcon,
  Shield,
  UserCheck,
  FileText,
  Server,
  Globe,
  BarChart2,
  CodeIcon,
  Layers,
  Zap,
  CreditCard,
  ArrowRight,
  ExternalLink,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import UseUserHook from "../../hooks/user/UseUserHook";

/* -------------------- theme helpers -------------------- */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) =>
    Number.isFinite(n) ? n : 0
  );
  return { r, g, b };
};

const rgba = (v: any, a = 1) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

function SectionCard({
  children,
  theme,
  isDark,
  className = "",
}: {
  children: React.ReactNode;
  theme: any;
  isDark: boolean;
  className?: string;
}) {
  return (
    <div
      className={["rounded-[24px] border transition-all duration-300", className].join(
        " "
      )}
      style={{
        borderColor: isDark
          ? rgba(theme?.border || "255 255 255", 0.1)
          : "rgba(251,146,60,0.14)",
        background: isDark
          ? "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))"
          : "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,250,246,0.82))",
        boxShadow: isDark
          ? "0 18px 50px rgba(0,0,0,0.28)"
          : "0 14px 40px rgba(251,146,60,0.10)",
        backdropFilter: "blur(10px)",
      }}
    >
      {children}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone = "default",
  isDark,
  theme,
}: any) {
  const toneStyles =
    tone === "success"
      ? {
          iconBg: isDark ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.10)",
          iconColor: isDark ? "rgba(52,211,153,0.95)" : "rgba(5,150,105,0.95)",
          border: isDark ? "rgba(16,185,129,0.18)" : "rgba(16,185,129,0.16)",
        }
      : tone === "info"
      ? {
          iconBg: isDark ? "rgba(59,130,246,0.12)" : "rgba(249,115,22,0.10)",
          iconColor: isDark ? "rgba(96,165,250,0.95)" : "rgba(249,115,22,0.95)",
          border: isDark ? "rgba(59,130,246,0.18)" : "rgba(251,146,60,0.16)",
        }
      : {
          iconBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)",
          iconColor: isDark ? "rgba(255,255,255,0.88)" : "rgba(51,65,85,0.92)",
          border: isDark
            ? rgba(theme?.border || "255 255 255", 0.12)
            : "rgba(251,146,60,0.14)",
        };

  return (
    <SectionCard theme={theme} isDark={isDark} className="p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl border"
          style={{
            background: toneStyles.iconBg,
            color: toneStyles.iconColor,
            borderColor: toneStyles.border,
          }}
        >
          {icon}
        </div>

        <div>
          <div
            className="text-xs"
            style={{
              color: isDark
                ? rgba(theme?.fg || "255 255 255", 0.58)
                : "rgba(100,116,139,0.96)",
            }}
          >
            {label}
          </div>
          <div
            className="text-lg font-bold"
            style={{
              color: isDark
                ? rgba(theme?.fg || "255 255 255", 0.94)
                : "rgba(15,23,42,0.98)",
            }}
          >
            {value}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function FeatureRow({
  icon,
  title,
  description,
  theme,
  isDark,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  theme: any;
  isDark: boolean;
}) {
  return (
    <div
      className="flex items-start gap-4 rounded-2xl border p-4"
      style={{
        borderColor: isDark
          ? rgba(theme?.border || "255 255 255", 0.1)
          : "rgba(251,146,60,0.14)",
        background: isDark ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.80)",
      }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
        style={{
          borderColor: isDark
            ? "rgba(59,130,246,0.18)"
            : "rgba(251,146,60,0.16)",
          background: isDark ? "rgba(59,130,246,0.10)" : "rgba(249,115,22,0.10)",
          color: isDark ? "rgba(96,165,250,0.95)" : "rgba(249,115,22,0.95)",
        }}
      >
        {icon}
      </div>

      <div>
        <h4
          className="text-sm font-semibold sm:text-base"
          style={{
            color: isDark
              ? rgba(theme?.fg || "255 255 255", 0.92)
              : "rgba(30,41,59,0.96)",
          }}
        >
          {title}
        </h4>
        <p
          className="mt-1 text-sm"
          style={{
            color: isDark
              ? rgba(theme?.fg || "255 255 255", 0.58)
              : "rgba(100,116,139,0.96)",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

function DownloadCard({
  icon,
  title,
  description,
  link,
  theme,
  isDark,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link?: string;
  theme: any;
  isDark: boolean;
}) {
  const accentColor = isDark
    ? "rgba(96,165,250,0.95)"
    : "rgba(249,115,22,0.95)";

  return (
    <motion.a
      href={link || "#"}
      target="_blank"
      rel="noreferrer"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      className="block"
    >
      <SectionCard theme={theme} isDark={isDark} className="h-full p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl border"
            style={{
              borderColor: isDark
                ? "rgba(59,130,246,0.18)"
                : "rgba(251,146,60,0.16)",
              background: isDark ? "rgba(59,130,246,0.10)" : "rgba(249,115,22,0.10)",
              color: accentColor,
            }}
          >
            {icon}
          </div>

          <div
            className="grid h-10 w-10 place-items-center rounded-xl border"
            style={{
              borderColor: isDark
                ? rgba(theme?.border || "255 255 255", 0.12)
                : "rgba(251,146,60,0.14)",
              background: isDark
                ? "rgba(255,255,255,0.03)"
                : "rgba(255,255,255,0.80)",
              color: accentColor,
            }}
          >
            <Download className="h-4 w-4" />
          </div>
        </div>

        <h3
          className="text-base font-semibold"
          style={{
            color: isDark
              ? rgba(theme?.fg || "255 255 255", 0.94)
              : "rgba(15,23,42,0.98)",
          }}
        >
          {title}
        </h3>

        <p
          className="mt-2 text-sm"
          style={{
            color: isDark
              ? rgba(theme?.fg || "255 255 255", 0.58)
              : "rgba(100,116,139,0.96)",
          }}
        >
          {description}
        </p>
      </SectionCard>
    </motion.a>
  );
}

const UserPlatform = () => {
  const loggedUser = useSelector((store: any) => store.user?.loggedUser);
  const siteConfig = useSelector((store: any) => store.user?.siteConfig);
  const mode = useSelector((store: any) => store.userTheme?.mode || "light");
  const themeConfig = useSelector((store: any) => store.user?.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const isDark = mode === "dark";

  const { getUpdateLoggedUser } = UseUserHook();

  useEffect(() => {
    getUpdateLoggedUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const titleColor = isDark
    ? rgba(theme?.fg || "255 255 255", 0.96)
    : "rgba(15,23,42,0.98)";

  const mutedTextColor = isDark
    ? rgba(theme?.fg || "255 255 255", 0.62)
    : "rgba(100,116,139,0.96)";

  const accentColor = isDark
    ? "rgba(96,165,250,0.95)"
    : "rgba(249,115,22,0.95)";

  const pageBackground = isDark
    ? `
      radial-gradient(circle at top left, rgba(59,130,246,0.10), transparent 30%),
      radial-gradient(circle at top right, rgba(168,85,247,0.08), transparent 28%),
      linear-gradient(180deg, rgba(2,6,23,1) 0%, rgba(10,15,23,1) 100%)
    `
    : `
      radial-gradient(circle at top left, rgba(251,146,60,0.12), transparent 32%),
      radial-gradient(circle at top right, rgba(249,115,22,0.07), transparent 30%),
      linear-gradient(180deg, #fff7ed 0%, #fffaf5 45%, #ffffff 100%)
    `;

  const highlights = [
    {
      icon: <BarChart2 className="h-4 w-4" />,
      text: "Advanced Analytics",
    },
    {
      icon: <Globe className="h-4 w-4" />,
      text: "Global Market Access",
    },
    {
      icon: <CodeIcon className="h-4 w-4" />,
      text: "Algorithmic Trading",
    },
  ];

  const downloads = [
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: "Android",
      description: "Trade on the go with full platform capabilities.",
      link: siteConfig?.androidDL,
    },
    {
      icon: <AppleIcon className="h-5 w-5" />,
      title: "iOS",
      description: "Seamless trading experience for Apple devices.",
      link: siteConfig?.iosDL,
    },
    {
      icon: <Monitor className="h-5 w-5" />,
      title: "Windows",
      description: "Full-featured desktop trading environment.",
      link: siteConfig?.windowsDL,
    },
  ];

  const features = [
    {
      icon: <Server className="h-5 w-5" />,
      title: "Robust Infrastructure",
      description: "99.9% uptime with low-latency global servers.",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Bank-Grade Security",
      description: "Multi-factor authentication and strong data encryption.",
    },
    {
      icon: <Layers className="h-5 w-5" />,
      title: "Multi-Asset Trading",
      description: "Trade forex, stocks, crypto, and more from one platform.",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Lightning Fast Execution",
      description: "Optimized execution speed for smoother trading actions.",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: "Easy Deposits",
      description: "Multiple payment methods with simple account funding.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen w-full"
      style={{ background: pageBackground }}
    >
      <div className="mx-auto w-full max-w-7xl p-4 sm:p-5 md:p-6">
        {!loggedUser?.kycVerified ? (
          <SectionCard theme={theme} isDark={isDark} className="overflow-hidden">
            <div
              className="border-b px-5 py-4 sm:px-6"
              style={{
                borderColor: isDark
                  ? rgba(theme?.border || "255 255 255", 0.1)
                  : "rgba(251,146,60,0.12)",
                background: isDark
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(255,255,255,0.38)",
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" style={{ color: accentColor }} />
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: mutedTextColor }}
                >
                  verification · security · onboarding
                </span>
              </div>

              <h1
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: titleColor, fontFamily: "'Poppins', sans-serif" }}
              >
                Identity Verification
              </h1>

              <p
                className="mt-2 text-sm sm:text-[15px]"
                style={{ color: mutedTextColor }}
              >
                Complete your KYC process to unlock full access to the trading
                platform and secure account features.
              </p>
            </div>

            <div className="p-4 sm:p-5 md:p-6">
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                  theme={theme}
                  isDark={isDark}
                  icon={<FileText className="h-5 w-5" />}
                  label="Step 1"
                  value="Document Preparation"
                  tone="default"
                />
                <StatCard
                  theme={theme}
                  isDark={isDark}
                  icon={<UserCheck className="h-5 w-5" />}
                  label="Step 2"
                  value="Information Submission"
                  tone="info"
                />
                <StatCard
                  theme={theme}
                  isDark={isDark}
                  icon={<BadgeCheck className="h-5 w-5" />}
                  label="Step 3"
                  value="Final Verification"
                  tone="success"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {[
                  {
                    icon: <FileText className="h-5 w-5" />,
                    title: "Document Preparation",
                    description:
                      "Gather a government-issued ID, proof of address, and any required supporting documents.",
                  },
                  {
                    icon: <UserCheck className="h-5 w-5" />,
                    title: "Information Submission",
                    description:
                      "Securely upload your personal details and complete the required verification form.",
                  },
                  {
                    icon: <Shield className="h-5 w-5" />,
                    title: "Final Verification",
                    description:
                      "Our team reviews your submitted details to activate full account access.",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SectionCard
                      theme={theme}
                      isDark={isDark}
                      className="h-full p-4 sm:p-5"
                    >
                      <div
                        className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border"
                        style={{
                          borderColor: isDark
                            ? "rgba(59,130,246,0.18)"
                            : "rgba(251,146,60,0.16)",
                          background: isDark
                            ? "rgba(59,130,246,0.10)"
                            : "rgba(249,115,22,0.10)",
                          color: accentColor,
                        }}
                      >
                        {item.icon}
                      </div>

                      <h3
                        className="text-base font-semibold"
                        style={{ color: titleColor }}
                      >
                        {item.title}
                      </h3>

                      <p
                        className="mt-2 text-sm"
                        style={{ color: mutedTextColor }}
                      >
                        {item.description}
                      </p>
                    </SectionCard>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <Link to="/user/account-details">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.985 }}
                    className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300"
                    style={{
                      background: isDark
                        ? "linear-gradient(135deg, rgba(59,130,246,0.95), rgba(96,165,250,0.88))"
                        : "linear-gradient(135deg, rgba(249,115,22,0.96), rgba(251,146,60,0.92))",
                      color: "#fff",
                      boxShadow: isDark
                        ? "0 14px 36px rgba(59,130,246,0.24)"
                        : "0 14px 36px rgba(249,115,22,0.22)",
                    }}
                  >
                    Start Verification
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </Link>
              </div>
            </div>
          </SectionCard>
        ) : (
          <SectionCard theme={theme} isDark={isDark} className="overflow-hidden">
            <div
              className="border-b px-5 py-4 sm:px-6"
              style={{
                borderColor: isDark
                  ? rgba(theme?.border || "255 255 255", 0.1)
                  : "rgba(251,146,60,0.12)",
                background: isDark
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(255,255,255,0.38)",
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: mutedTextColor }}
                >
                  mt5 · trading · downloads
                </span>
              </div>

              <h1
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: titleColor, fontFamily: "'Poppins', sans-serif" }}
              >
                MetaTrader 5 Platform
              </h1>

              <p
                className="mt-2 text-sm sm:text-[15px]"
                style={{ color: mutedTextColor }}
              >
                Download, explore, and access your professional trading platform
                across desktop, mobile, and web.
              </p>
            </div>

            <div className="p-4 sm:p-5 md:p-6">
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  theme={theme}
                  isDark={isDark}
                  icon={<Globe className="h-5 w-5" />}
                  label="Access"
                  value="Global Markets"
                  tone="info"
                />
                <StatCard
                  theme={theme}
                  isDark={isDark}
                  icon={<BarChart2 className="h-5 w-5" />}
                  label="Insights"
                  value="Advanced Analytics"
                  tone="default"
                />
                <StatCard
                  theme={theme}
                  isDark={isDark}
                  icon={<CodeIcon className="h-5 w-5" />}
                  label="Automation"
                  value="Algo Trading"
                  tone="info"
                />
                <StatCard
                  theme={theme}
                  isDark={isDark}
                  icon={<Shield className="h-5 w-5" />}
                  label="Protection"
                  value="Secure Access"
                  tone="success"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6">
                  <SectionCard theme={theme} isDark={isDark} className="p-4 sm:p-5">
                    <div className="mb-4">
                      <h2
                        className="text-xl font-bold sm:text-2xl"
                        style={{
                          color: titleColor,
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      >
                        Platform Downloads
                      </h2>
                      <p
                        className="mt-2 text-sm"
                        style={{ color: mutedTextColor }}
                      >
                        Choose your preferred device and start trading with the
                        full MT5 experience.
                      </p>
                    </div>

                    <div className="mb-5 flex flex-wrap gap-2">
                      {highlights.map((item, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold"
                          style={{
                            borderColor: isDark
                              ? "rgba(59,130,246,0.18)"
                              : "rgba(251,146,60,0.16)",
                            background: isDark
                              ? "rgba(59,130,246,0.10)"
                              : "rgba(255,237,213,0.70)",
                            color: isDark
                              ? "rgba(96,165,250,0.95)"
                              : "rgba(194,65,12,0.95)",
                          }}
                        >
                          {item.icon}
                          {item.text}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {downloads.map((item, index) => (
                        <DownloadCard
                          key={index}
                          icon={item.icon}
                          title={item.title}
                          description={item.description}
                          link={item.link}
                          theme={theme}
                          isDark={isDark}
                        />
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <motion.a
                        href={siteConfig?.webLink || siteConfig?.androidDL || "#"}
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.985 }}
                        className="block"
                      >
                        <SectionCard
                          theme={theme}
                          isDark={isDark}
                          className="h-full p-4 sm:p-5"
                        >
                          <div className="mb-3 flex items-center gap-3">
                            <div
                              className="flex h-11 w-11 items-center justify-center rounded-2xl border"
                              style={{
                                borderColor: isDark
                                  ? "rgba(59,130,246,0.18)"
                                  : "rgba(251,146,60,0.16)",
                                background: isDark
                                  ? "rgba(59,130,246,0.10)"
                                  : "rgba(249,115,22,0.10)",
                                color: accentColor,
                              }}
                            >
                              <ExternalLink className="h-5 w-5" />
                            </div>

                            <div>
                              <h3
                                className="text-base font-semibold"
                                style={{ color: titleColor }}
                              >
                                Web Platform
                              </h3>
                              <p
                                className="text-sm"
                                style={{ color: mutedTextColor }}
                              >
                                Open the trading platform directly in your browser.
                              </p>
                            </div>
                          </div>
                        </SectionCard>
                      </motion.a>

                      <SectionCard theme={theme} isDark={isDark} className="h-full p-4 sm:p-5">
                        <div className="mb-3 flex items-center gap-3">
                          <div
                            className="flex h-11 w-11 items-center justify-center rounded-2xl border"
                            style={{
                              borderColor: isDark
                                ? "rgba(16,185,129,0.18)"
                                : "rgba(16,185,129,0.16)",
                              background: isDark
                                ? "rgba(16,185,129,0.10)"
                                : "rgba(16,185,129,0.08)",
                              color: isDark
                                ? "rgba(52,211,153,0.95)"
                                : "rgba(5,150,105,0.95)",
                            }}
                          >
                            <Shield className="h-5 w-5" />
                          </div>

                          <div>
                            <h3
                              className="text-base font-semibold"
                              style={{ color: titleColor }}
                            >
                              Secure & Compliant
                            </h3>
                            <p
                              className="text-sm"
                              style={{ color: mutedTextColor }}
                            >
                              Bank-grade encryption, secure infrastructure, and
                              trusted account protection.
                            </p>
                          </div>
                        </div>
                      </SectionCard>
                    </div>
                  </SectionCard>
                </div>

                <div className="space-y-6">
                  <SectionCard theme={theme} isDark={isDark} className="p-4 sm:p-5">
                    <div className="mb-4">
                      <h2
                        className="text-xl font-bold sm:text-2xl"
                        style={{
                          color: titleColor,
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      >
                        Why Choose Our Platform
                      </h2>
                      <p
                        className="mt-2 text-sm"
                        style={{ color: mutedTextColor }}
                      >
                        A polished trading experience built for performance,
                        security, and flexibility.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {features.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                        >
                          <FeatureRow
                            icon={item.icon}
                            title={item.title}
                            description={item.description}
                            theme={theme}
                            isDark={isDark}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              </div>
            </div>
          </SectionCard>
        )}
      </div>
    </motion.div>
  );
};

export default UserPlatform;