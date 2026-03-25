import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Sparkles,
  Coins,
  Cpu,
  ShieldCheck,
  Zap,
} from "lucide-react";

import {
  setLoggedUser,
} from "../../redux/user/userSlice";


import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { userApi } from "../../utils/apiClients";
import ModernHeading from "../lib/ModernHeading";
import UserNewChallengeHook from "../../hooks/user/UseNewChallengeHook";
import UseUserHook from "../../hooks/user/UseUserHook";
import { FloatingParticles } from "../../utils/FloatingParticles";
import { FloatingOrbs } from "../../utils/FloatingOrbs";
import { AnimatedGrid } from "../../utils/AnimatedGrid";

/* -------------------- theme helpers (RGB strings -> css) ------------------- */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0")
    .trim()
    .replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) =>
    Number.isFinite(n) ? n : 0
  );
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

/* ========================== DECOR / THEME ========================== */

function GlassCard({
  className = "",
  children,
  theme,
}: {
  className?: string;
  children: any;
  theme: any;
}) {
  const cardStyle = {
    borderRadius: "24px",
    border: `1px solid ${rgba(
      theme?.border || theme?.inputBorder || "255 255 255",
      0.14
    )}`,
    background: `linear-gradient(135deg,
      ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.72)},
      ${rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.78)},
      ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.72)}
    )`,
    boxShadow: `0 18px 70px ${rgba(theme?.shadowColor || "0 0 0", 0.55)}`,
    backdropFilter: "blur(18px)",
  } as React.CSSProperties;

  const innerGlow = {
    position: "absolute" as const,
    inset: "1px",
    borderRadius: "calc(24px - 1px)",
    background: `linear-gradient(135deg,
      ${rgba(theme?.gradientFrom || theme?.accent || "59 130 246", 0.08)},
      ${rgba(theme?.accent || "59 130 246", 0.05)},
      ${rgba(theme?.gradientTo || "147 51 234", 0.08)}
    )`,
    pointerEvents: "none" as const,
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className={`relative ${className}`}
      style={cardStyle}
    >
      <div style={innerGlow} />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

/* ========================== COMPONENT ========================== */

export default function UserNewChallenge() {
  const navigate = useNavigate();
  const loggedUser = useSelector((store: any) => store.user.loggedUser);
  const siteConfig = useSelector((state: any) => state.user.siteConfig);
const dispatch = useDispatch();
  // ✅ dynamic theme (same as LoginLogs)
  const themeConfig = useSelector((state: any) => state.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const radius = theme?.radius || "14px";

  const { getPlatforms, getPaymentMethod } = UserNewChallengeHook();
  const { getUpdateLoggedUser } = UseUserHook();
  const platformData = useSelector((store: any) => store.user.platforms);

  const [accountConfigurations, setAccountConfigurations] = useState<any[]>([]);
  const [creatingLoading, setCreatingLoading] = useState(false);

  const [formData, setFormData] = useState({
    accountType: "",
    apiGroup: "",
    platform: "",
    leverage: "",
  });

  const filteredPlatformData = useMemo(
    () => (platformData || []).filter((p: any) => p?.status === "active"),
    [platformData]
  );

  const selectedConfig = useMemo(
    () =>
      accountConfigurations?.find(
        (v) => v.accountType === formData.accountType
      ),
    [accountConfigurations, formData.accountType]
  );

  /* --------------------------- Fetch configs --------------------------- */
  const fetchAccountConfigurations = async () => {
    try {
      const res = await userApi.get(`/get-account-types`);
      setAccountConfigurations(
        Array.isArray(res?.data?.data) ? res.data.data : []
      );
    } catch (error) {
      console.log("Error fetching account types", error);
      toast.error("Failed to fetch account types");
    }
  };

  useEffect(() => {
    getPlatforms();
    getPaymentMethod();
    fetchAccountConfigurations();
  }, []);

  useEffect(() => {
    if (selectedConfig?.leverage?.length) {
      setFormData((prev) => ({
        ...prev,
        leverage: selectedConfig.leverage[0]?.value || "",
        apiGroup: selectedConfig.apiGroup || prev.apiGroup,
      }));
    }
  }, [selectedConfig?.leverage, selectedConfig?.apiGroup]);

  useEffect(() => {
    if (filteredPlatformData?.length === 1) {
      setFormData((prev) => ({
        ...prev,
        platform: filteredPlatformData[0]?.name || "",
      }));
    }
  }, [filteredPlatformData]);

  /* --------------------------- Handlers --------------------------- */
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "accountType") {
      const cfg = accountConfigurations?.find((c) => c.accountType === value);
      setFormData((prev) => ({
        ...prev,
        accountType: value,
        apiGroup: cfg?.apiGroup || "",
        leverage: cfg?.leverage?.[0]?.value || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const createAccountHandler = async () => {
    if (creatingLoading) return;

    if (!loggedUser?._id)
      return toast.error("Please sign in to create an account.");
    if (!formData.accountType) return toast.error("Select an account type.");
    if (!formData.leverage) return toast.error("Select leverage.");
    if (!formData.platform) return toast.error("Choose a platform.");

    setCreatingLoading(true);
    const toastID = toast.loading("Creating your account...");

    try {
      const response = await userApi.post(
        `/create-mt5-account/${loggedUser._id}`,
        {
          leverage: formData.leverage,
          accountType: formData.accountType,
          groupName: formData.apiGroup,
          platform: formData.platform,
          siteConfig,
          VITE_MANAGER_INDEX: import.meta.env.VITE_MANAGER_INDEX,
          VITE_WEBSITE_NAME: import.meta.env.VITE_WEBSITE_NAME,
          VITE_EMAIL_WEBSITE: import.meta.env.VITE_EMAIL_WEBSITE,
        }
      );

      if (response?.data?.message === "MT5 account created successfully") {
        toast.success("Account created successfully!", { id: toastID });
          dispatch(setLoggedUser(response.data.user));
        navigate("/user/challenges");
      } else {
        toast.error(response?.data?.message || "Failed to create account", {
          id: toastID,
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong while creating the account.", {
        id: toastID,
      });
    } finally {
      setCreatingLoading(false);
    }
  };

  /* --------------------------- Anim --------------------------- */
  const container = {
    hidden: { opacity: 0, y: 30, scale: 0.98, rotateX: 6 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.06,
      },
    },
  };

  /* --------------------------- Theme styles --------------------------- */
  const pageBgStyle = {
    minHeight: "100vh",
    background: `radial-gradient(1200px 600px at 18% 0%, ${rgba(
      theme?.glow || theme?.accent,
      0.16
    )}, transparent 60%),
                 radial-gradient(900px 480px at 82% 12%, ${rgba(
                   theme?.gradientTo || theme?.accent,
                   0.12
                 )}, transparent 55%),
                 linear-gradient(135deg, ${rgb(theme?.bg || "0 0 0")}, ${rgb(
      theme?.surface1 || theme?.bg || "0 0 0"
    )}, ${rgb(theme?.bg || "0 0 0")})`,
    color: rgb(theme?.fg || "255 255 255"),
  } as React.CSSProperties;

  const mutedText = {
    color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.7),
  };
  const eyebrowText = {
    color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.68),
  };

  const iconAccent = {
    color: rgba(theme?.accent || theme?.gradientFrom || "59 130 246", 0.95),
  };

  // add near your theme styles
  const dropdownBg = rgb(
    theme?.surface3 || theme?.surface2 || theme?.card || theme?.bg || "18 18 18"
  );
  const dropdownBorder = rgba(
    theme?.inputBorder || theme?.border || "255 255 255",
    0.18
  );

  const selectStyle = {
    width: "100%",
    borderRadius: radius,
    backgroundColor: dropdownBg, // ✅ solid background (not translucent)
    border: `1px solid ${dropdownBorder}`,
    color: rgb(theme?.fg || "255 255 255"),
    padding: "12px 42px 12px 12px",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    colorScheme: "dark", // ✅ helps dropdown render dark in many browsers
  } as React.CSSProperties;

  const optionStyle = {
    backgroundColor: dropdownBg, // ✅ dropdown items bg
    color: rgb(theme?.fg || "255 255 255"),
  } as React.CSSProperties;

  const selectStyle1 = {
    borderRadius: radius,
    background: rgba(theme?.input || theme?.surface1 || "18 18 18", 0.35),
    border: `1px solid ${rgba(
      theme?.inputBorder || theme?.border || "255 255 255",
      0.18
    )}`,
    color: rgb(theme?.fg || "255 255 255"),
    padding: "12px 42px 12px 12px",
    outline: "none",
  } as React.CSSProperties;

  const ctaStyle = {
    borderRadius: "999px",
    color: rgb(theme?.primaryFg || "0 0 0"),
    background: `linear-gradient(90deg, ${rgb(
      theme?.gradientFrom || theme?.accent || "59 130 246"
    )}, ${rgb(theme?.accent || theme?.primary || "34 197 94")}, ${rgb(
      theme?.gradientTo || "147 51 234"
    )})`,
    boxShadow: `0 14px 36px ${rgba(
      theme?.glow || theme?.accent || "59 130 246",
      0.26
    )}`,
  } as React.CSSProperties;

  const platformBtnBase = {
    borderRadius: "18px",
    border: `1px solid ${rgba(
      theme?.border || theme?.inputBorder || "255 255 255",
      0.14
    )}`,
    background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.22),
    color: rgba(theme?.fg || "255 255 255", 0.9),
  } as React.CSSProperties;

  const platformBtnActive = {
    border: `1px solid ${rgba(
      theme?.ring || theme?.accent || "59 130 246",
      0.35
    )}`,
    background: rgba(theme?.accent || "59 130 246", 0.14),
    boxShadow: `0 0 28px ${rgba(
      theme?.glow || theme?.accent || "59 130 246",
      0.18
    )}`,
    color: rgba(theme?.fg || "255 255 255", 0.95),
  } as React.CSSProperties;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden"
      style={pageBgStyle}
    >
      <AnimatedGrid />
      <FloatingOrbs />
      <FloatingParticles />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 md:px-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} style={iconAccent} />
            <span
              className="uppercase tracking-[0.25em] text-xs font-semibold"
              style={eyebrowText}
            >
              accounts · mt5 · setup
            </span>
          </div>

          <ModernHeading text="Open MT5 Account" />

          <p className="mt-1" style={mutedText}>
            Pick your account type, dial the leverage, choose your platform —
            you’re live in minutes.
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Form */}
          <GlassCard theme={theme} className="lg:col-span-7 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Type */}
              <div>
                <label
                  className="block mb-2 font-semibold flex items-center gap-2"
                  style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}
                >
                  <Coins className="w-4 h-4" style={iconAccent} />
                  1. Choose Account Type
                </label>

                <div className="relative">
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    style={selectStyle}
                    onFocus={(e) => {
                      (
                        e.currentTarget as HTMLSelectElement
                      ).style.boxShadow = `0 0 0 3px ${rgba(
                        theme?.ring || theme?.accent || "59 130 246",
                        0.25
                      )}`;
                      (e.currentTarget as HTMLSelectElement).style.borderColor =
                        rgba(
                          theme?.ring || theme?.accent || "59 130 246",
                          0.45
                        );
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLSelectElement).style.boxShadow =
                        "none";
                      (e.currentTarget as HTMLSelectElement).style.borderColor =
                        rgba(
                          theme?.inputBorder || theme?.border || "255 255 255",
                          0.18
                        );
                    }}
                  >
                    <option value="" disabled style={optionStyle}>
                      Select Account Type
                    </option>

                    {accountConfigurations?.map((opt) => (
                      <option
                        key={opt.accountType}
                        value={opt.accountType}
                        style={optionStyle}
                      >
                        {opt.accountType}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}
                  />
                </div>
              </div>

              {/* Leverage */}
              <div>
                <label
                  className="block mb-2 font-semibold flex items-center gap-2"
                  style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}
                >
                  <ShieldCheck className="w-4 h-4" style={iconAccent} />
                  2. Choose Leverage
                </label>

                <div className="relative">
                  <select
                    name="leverage"
                    value={formData.leverage}
                    onChange={handleInputChange}
                    disabled={!selectedConfig?.leverage?.length}
                    style={{
                      ...selectStyle,
                      opacity: !selectedConfig?.leverage?.length ? 0.55 : 1,
                      cursor: !selectedConfig?.leverage?.length
                        ? "not-allowed"
                        : "pointer",
                    }}
                    onFocus={(e) => {
                      (
                        e.currentTarget as HTMLSelectElement
                      ).style.boxShadow = `0 0 0 3px ${rgba(
                        theme?.ring || theme?.accent || "59 130 246",
                        0.25
                      )}`;
                      (e.currentTarget as HTMLSelectElement).style.borderColor =
                        rgba(
                          theme?.ring || theme?.accent || "59 130 246",
                          0.45
                        );
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLSelectElement).style.boxShadow =
                        "none";
                      (e.currentTarget as HTMLSelectElement).style.borderColor =
                        rgba(
                          theme?.inputBorder || theme?.border || "255 255 255",
                          0.18
                        );
                    }}
                  >
                    <option value="" disabled>
                      {selectedConfig?.leverage?.length
                        ? "Select Leverage"
                        : "Select account type first"}
                    </option>
                    {selectedConfig?.leverage?.map((l: any) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}
                  />
                </div>
              </div>
            </div>

            {/* Platform */}
            <div className="mt-8">
              <label
                className="block mb-4 font-semibold flex items-center gap-2"
                style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}
              >
                <Cpu className="w-4 h-4" style={iconAccent} />
                3. Choose your Platform
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <AnimatePresence initial={false}>
                  {filteredPlatformData?.map((plt: any, i: number) => {
                    const active = formData.platform === plt.name;

                    return (
                      <motion.button
                        key={plt.name}
                        onClick={() =>
                          setFormData((p) => ({ ...p, platform: plt.name }))
                        }
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 p-4"
                        style={{
                          ...platformBtnBase,
                          ...(active ? platformBtnActive : {}),
                        }}
                      >
                        <span className="text-2xl">{plt.logo ?? "🧭"}</span>
                        <span
                          className="font-semibold"
                          style={{
                            color: active
                              ? rgba(theme?.accent || "59 130 246", 0.95)
                              : rgba(theme?.fg || "255 255 255", 0.9),
                          }}
                        >
                          {plt.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* CTA */}
            <div className="flex justify-center mt-10">
              <motion.button
                whileHover={{ scale: creatingLoading ? 1 : 1.03 }}
                whileTap={{ scale: creatingLoading ? 1 : 0.98 }}
                onClick={createAccountHandler}
                disabled={creatingLoading}
                className="relative inline-flex items-center justify-center gap-2 px-8 py-3 font-bold"
                style={{
                  ...ctaStyle,
                  opacity: creatingLoading ? 0.6 : 1,
                  cursor: creatingLoading ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!creatingLoading) {
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.boxShadow = `0 18px 44px ${rgba(
                      theme?.glow || theme?.accent || "59 130 246",
                      0.34
                    )}`;
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    ctaStyle.boxShadow as string;
                }}
              >
                <Zap className="w-5 h-5" />
                {creatingLoading ? "Creating..." : "Create Account"}

                <motion.span
                  className="absolute inset-0 rounded-full opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: `radial-gradient(120% 120% at 50% 10%, ${rgba(
                      theme?.fg || "255 255 255",
                      0.28
                    )}, transparent 40%)`,
                  }}
                />
              </motion.button>
            </div>
          </GlassCard>

          {/* Right: Review */}
          <GlassCard theme={theme} className="lg:col-span-5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={iconAccent} />
              <h3
                className="text-lg font-semibold"
                style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}
              >
                Review & Summary
              </h3>
            </div>

            <div
              className="space-y-3"
              style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}
            >
              <Row
                theme={theme}
                label="Account Type"
                value={formData.accountType || "—"}
                radius={radius}
              />
              <Row
                theme={theme}
                label="Leverage"
                value={formData.leverage || "—"}
                radius={radius}
              />
              <Row
                theme={theme}
                label="Platform"
                value={formData.platform || "—"}
                radius={radius}
              />
               <Row
                theme={theme}
                label="Server Name"
                value={siteConfig.serverName || "—"}
                radius={radius}
              />
            </div>

            <div
              className="mt-6 text-xs"
              style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.62) }}
            >
              By creating an account you agree to our trading terms & risk
              disclosure.
            </div>
          </GlassCard>
        </div>

        {/* Footer note */}
        <div
          className="text-center mt-8 text-sm"
          style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.55) }}
        >
          Fully encrypted. Lightning-fast provisioning ⚡
        </div>
      </div>
    </motion.div>
  );
}

/* --------------------------- Small bits --------------------------- */

function Row({
  label,
  value,
  theme,
  radius,
}: {
  label: string;
  value: string;
  theme: any;
  radius: string;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 border"
      style={{
        borderRadius: radius,
        borderColor: rgba(
          theme?.border || theme?.inputBorder || "255 255 255",
          0.14
        ),
        background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.22),
      }}
    >
      <span
        style={{
          color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.62),
        }}
      >
        {label}
      </span>
      <span
        className="font-semibold"
        style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}
      >
        {value}
      </span>
    </div>
  );
}
