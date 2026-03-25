import { useEffect, useMemo, type CSSProperties } from "react";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import UseUserHook from "../../hooks/user/UseUserHook";
import ModernHeading from "../lib/ModernHeading";
import { FloatingParticles } from "../../utils/FloatingParticles";
import { AnimatedGrid } from "../../utils/AnimatedGrid";

/* -------------------- theme helpers (RGB strings -> css) ------------------- */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) => (Number.isFinite(n) ? n : 0));
  return { r, g, b };
};
const rgb = (v: any) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgb(${r}, ${g}, ${b})`;
};
const rgba = (v: any, a = 1) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const UserPlatform = () => {
  const loggedUser = useSelector((store: any) => store.user.loggedUser);
  const siteConfig = useSelector((state: any) => state.user.siteConfig);

  // ✅ dynamic theme
  const themeConfig = useSelector((state: any) => state.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const radius = theme?.radius || "16px";

  const { getUpdateLoggedUser } = UseUserHook();

  useEffect(() => {
    getUpdateLoggedUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pageBgStyle: CSSProperties = {
    minHeight: "100vh",
    padding: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    background: `radial-gradient(1200px 700px at 18% 0%, ${rgba(theme?.glow || theme?.accent, 0.16)}, transparent 60%),
                 radial-gradient(900px 520px at 82% 12%, ${rgba(theme?.gradientTo || theme?.accent, 0.12)}, transparent 55%),
                 linear-gradient(135deg, ${rgb(theme?.bg || "0 0 0")}, ${rgb(theme?.surface1 || theme?.bg || "0 0 0")}, ${rgb(
      theme?.bg || "0 0 0"
    )})`,
    color: rgb(theme?.fg || "255 255 255"),
  };

  const mutedText: CSSProperties = { color: rgba(theme?.mutedFg || theme?.fg, 0.72) };
  const subtleText: CSSProperties = { color: rgba(theme?.mutedFg || theme?.fg, 0.6) };

  const cardStyle: CSSProperties = {
    borderRadius: "22px",
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    background: `linear-gradient(135deg,
      ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.72)},
      ${rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.78)},
      ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.72)})`,
    boxShadow: `0 18px 70px ${rgba(theme?.shadowColor || "0 0 0", 0.55)}`,
    backdropFilter: "blur(16px)",
  };

  const softPanel: CSSProperties = {
    borderRadius: "16px",
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12)}`,
    background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.18),
  };

  const accentBtn: CSSProperties = {
    borderRadius: "999px",
    padding: "14px 22px",
    fontWeight: 800,
    color: rgb(theme?.primaryFg || "0 0 0"),
    background: `linear-gradient(90deg,
      ${rgb(theme?.gradientFrom || theme?.accent || "59 130 246")},
      ${rgb(theme?.accent || theme?.primary || "34 197 94")},
      ${rgb(theme?.gradientTo || "147 51 234")})`,
    border: `1px solid ${rgba(theme?.ring || theme?.accent || "59 130 246", 0.22)}`,
    boxShadow: `0 16px 46px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.22)}`,
  };

  return (
    <div style={pageBgStyle}>
      <AnimatedGrid />
      <FloatingParticles />

      {!loggedUser?.kycVerified ? (
        <KYCVerificationSection theme={theme} cardStyle={cardStyle} accentBtn={accentBtn} mutedText={mutedText} subtleText={subtleText} />
      ) : (
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            className="overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={cardStyle}
          >
            <div className="grid md:grid-cols-2 gap-8 p-8">
              <PlatformDownloadSection
                siteConfig={siteConfig}
                theme={theme}
                softPanel={softPanel}
                mutedText={mutedText}
                subtleText={subtleText}
              />
              <PlatformFeatureSection theme={theme} softPanel={softPanel} mutedText={mutedText} subtleText={subtleText} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const KYCVerificationSection = ({
  theme,
  cardStyle,
  accentBtn,
  mutedText,
  subtleText,
}: {
  theme: any;
  cardStyle: CSSProperties;
  accentBtn: CSSProperties;
  mutedText: CSSProperties;
  subtleText: CSSProperties;
}) => (
  <div className="w-full mx-auto p-4 relative z-10" style={{ maxWidth: 1100 }}>
    <div className="text-center mb-12" style={cardStyle}>
      <div className="p-10">
        <div className="flex justify-center mb-6">
          <div
            className="p-4 rounded-full"
            style={{
              background: rgba(theme?.accent || "59 130 246", 0.12),
              border: `1px solid ${rgba(theme?.accent || "59 130 246", 0.18)}`,
            }}
          >
            <Shield className="w-16 h-16" style={{ color: rgba(theme?.accent || "59 130 246", 0.95) }} />
          </div>
        </div>

        <h2
          className="text-4xl font-bold text-transparent bg-clip-text mb-4"
          style={{
            backgroundImage: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "59 130 246")}, ${rgb(
              theme?.accent || theme?.primary || "34 197 94"
            )}, ${rgb(theme?.gradientTo || "147 51 234")})`,
          }}
        >
          Identity Verification
        </h2>

        <p style={mutedText} className="max-w-2xl mx-auto">
          Secure your account and unlock full platform access through our comprehensive KYC process.
        </p>
      </div>
    </div>

    <div className="grid md:grid-cols-3 gap-8">
      {[
        {
          icon: FileText,
          title: "Document Preparation",
          description: "Gather government-issued ID, proof of address, and supporting documents",
        },
        {
          icon: UserCheck,
          title: "Information Submission",
          description: "Securely upload and verify your personal and financial information",
        },
        {
          icon: Shield,
          title: "Final Verification",
          description: "Our expert team reviews and validates your submitted documents",
        },
      ].map(({ icon: Icon, title, description }, index) => (
        <motion.div
          key={index}
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            borderRadius: "20px",
            border: `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`,
            background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.18),
            backdropFilter: "blur(14px)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
        >
          <div className="relative z-10">
            <div
              className="p-3 rounded-full inline-block mb-4"
              style={{
                background: rgba(theme?.accent || "59 130 246", 0.12),
                border: `1px solid ${rgba(theme?.accent || "59 130 246", 0.18)}`,
              }}
            >
              <Icon className="w-8 h-8" style={{ color: rgba(theme?.accent || "59 130 246", 0.95) }} />
            </div>
            <h3 className="font-bold text-xl mb-3" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
              {title}
            </h3>
            <p className="text-sm" style={subtleText}>
              {description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>

    <div className="text-center mt-12">
      <Link to="/user/account-details">
        <motion.button style={accentBtn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <span className="flex whitespace-nowrap text-xs md:text-md items-center justify-center gap-2">
            Start Verification
            <ArrowRight className="transition-transform" />
          </span>
        </motion.button>
      </Link>
    </div>
  </div>
);

const PlatformDownloadSection = ({
  siteConfig,
  theme,
  softPanel,
  mutedText,
  subtleText,
}: {
  siteConfig: any;
  theme: any;
  softPanel: CSSProperties;
  mutedText: CSSProperties;
  subtleText: CSSProperties;
}) => (
  <div className="space-y-6">
    <div className="py-2 mb-4">
      <ModernHeading text={"MetaTrader 5"} />
    </div>

    <p style={mutedText}>
      Unlock the power of professional trading with our advanced MetaTrader 5 platform. Designed for traders who demand
      precision, speed, and comprehensive market insights.
    </p>

    <div className="flex flex-wrap gap-y-2 gap-x-4 mb-6">
      {[
        { icon: <BarChart2 className="w-5 h-5" />, text: "Advanced Analytics" },
        { icon: <Globe className="w-5 h-5" />, text: "Global Market Access" },
        { icon: <CodeIcon className="w-5 h-5" />, text: "Algorithmic Trading" },
      ].map((highlight, index) => (
        <div key={index} className="flex items-center space-x-2 px-3 py-2 rounded-lg w-full sm:w-auto" style={softPanel}>
          <div style={{ color: rgba(theme?.accent || "59 130 246", 0.95) }}>{highlight.icon}</div>
          <span className="text-sm" style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}>
            {highlight.text}
          </span>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {[
        {
          icon: <Smartphone className="w-6 h-6" style={{ color: rgba(theme?.accent || "59 130 246", 0.95) }} />,
          text: "Android",
          link: siteConfig?.androidDL,
          description: "Trade on the go with full platform capabilities",
        },
        {
          icon: <AppleIcon className="w-6 h-6" style={{ color: rgba(theme?.accent || "59 130 246", 0.95) }} />,
          text: "iOS",
          link: siteConfig?.iosDL,
          description: "Seamless trading experience for Apple devices",
        },
        {
          icon: <Monitor className="w-6 h-6" style={{ color: rgba(theme?.accent || "59 130 246", 0.95) }} />,
          text: "Windows",
          link: siteConfig?.windowsDL,
          description: "Full-featured desktop trading environment",
        },
      ].map((platform, index) => (
        <motion.a key={index} href={platform.link} target="_blank" rel="noreferrer" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <div className="rounded-xl p-4 flex flex-col items-center gap-3" style={softPanel}>
            <div className="flex items-center gap-2">
              {platform.icon}
              <span className="text-sm font-semibold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                {platform.text}
              </span>
            </div>
            <p className="text-xs text-center" style={subtleText}>
              {platform.description}
            </p>
            <Download style={{ color: rgba(theme?.accent || "59 130 246", 0.95) }} className="transition-all" />
          </div>
        </motion.a>
      ))}
    </div>

    <a target="_blank" rel="noreferrer" href={siteConfig?.webLink || siteConfig?.androidDL}>
      <div className="rounded-xl p-4 mt-4 cursor-pointer" style={softPanel}>
        <div className="flex items-center space-x-3">
          <h3 className="font-semibold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
            Web Link
          </h3>
          <ExternalLink style={{ color: rgba(theme?.accent || "59 130 246", 0.95) }} className="w-6 h-6" />
        </div>
        <p className="text-sm mt-2" style={subtleText}>
          Trade seamlessly on our official website by clicking it and unlock a world of opportunities!
        </p>
      </div>
    </a>

    <div className="rounded-xl p-4 mt-4" style={softPanel}>
      <div className="flex items-center space-x-3">
        <Shield style={{ color: rgba(theme?.accent || "59 130 246", 0.95) }} className="w-6 h-6" />
        <h3 className="font-semibold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
          Secure & Compliant
        </h3>
      </div>
      <p className="text-sm mt-2" style={subtleText}>
        Bank-grade encryption, regulatory compliance, and multi-factor authentication ensure your trading security.
      </p>
    </div>
  </div>
);

const PlatformFeatureSection = ({
  theme,
  softPanel,
  mutedText,
  subtleText,
}: {
  theme: any;
  softPanel: CSSProperties;
  mutedText: CSSProperties;
  subtleText: CSSProperties;
}) => (
  <div className="rounded-2xl p-6 space-y-6" style={softPanel}>
    <h3 className="text-2xl font-bold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
      Why Choose Our Platform
    </h3>

    {[
      { icon: <Server />, title: "Robust Infrastructure", description: "99.9% uptime with low-latency global servers" },
      { icon: <Shield />, title: "Bank-Grade Security", description: "Multi-factor authentication and encryption" },
      { icon: <Layers />, title: "Multi-Asset Trading", description: "Trade forex, stocks, crypto from one platform" },
      { icon: <Zap />, title: "Lightning Fast Execution", description: "Millisecond trade execution speeds" },
      { icon: <CreditCard />, title: "Easy Deposits", description: "Multiple payment methods, instant processing" },
    ].map((feature, index) => (
      <motion.div
        key={index}
        className="flex items-center space-x-4 p-4 rounded-xl"
        style={{
          borderRadius: "16px",
          border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12)}`,
          background: rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.16),
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <div
          className="p-3 rounded-full"
          style={{
            background: rgba(theme?.accent || "59 130 246", 0.12),
            border: `1px solid ${rgba(theme?.accent || "59 130 246", 0.18)}`,
            color: rgba(theme?.accent || "59 130 246", 0.95),
          }}
        >
          {feature.icon}
        </div>
        <div>
          <h4 className="text-lg font-semibold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
            {feature.title}
          </h4>
          <p className="text-sm" style={subtleText}>
            {feature.description}
          </p>
        </div>
      </motion.div>
    ))}
  </div>
);

export default UserPlatform;
