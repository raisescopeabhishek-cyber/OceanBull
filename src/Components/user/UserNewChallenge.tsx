import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Sparkles,
  Coins,
  Cpu,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { setLoggedUser } from "../../redux/user/userSlice";
import { userApi } from "../../utils/apiClients";
import UserNewChallengeHook from "../../hooks/user/UseNewChallengeHook";
import UseUserHook from "../../hooks/user/UseUserHook";

/* -------------------- theme helpers -------------------- */
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
      className={[
        "rounded-[24px] border transition-all duration-300",
        className,
      ].join(" ")}
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

function SummaryRow({
  label,
  value,
  theme,
  isDark,
}: {
  label: string;
  value: string;
  theme: any;
  isDark: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-2xl border px-4 py-3"
      style={{
        borderColor: isDark
          ? rgba(theme?.border || "255 255 255", 0.1)
          : "rgba(251,146,60,0.14)",
        background: isDark
          ? "rgba(255,255,255,0.025)"
          : "rgba(255,255,255,0.78)",
      }}
    >
      <span
        className="text-sm"
        style={{
          color: isDark
            ? rgba(theme?.fg || "255 255 255", 0.58)
            : "rgba(100,116,139,0.95)",
        }}
      >
        {label}
      </span>

      <span
        className="text-sm font-semibold"
        style={{
          color: isDark
            ? rgba(theme?.fg || "255 255 255", 0.92)
            : "rgba(30,41,59,0.96)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function UserNewChallenge() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loggedUser = useSelector((store: any) => store.user?.loggedUser);
  const siteConfig = useSelector((state: any) => state.user?.siteConfig);
  const platformData = useSelector((store: any) => store.user?.platforms);
  const mode = useSelector((state: any) => state.userTheme?.mode || "light");
  const themeConfig = useSelector((state: any) => state.user?.themeConfig);

  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const isDark = mode === "dark";

  const { getPlatforms, getPaymentMethod } = UserNewChallengeHook();
  const { getUpdateLoggedUser } = UseUserHook();

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
        (item) => item.accountType === formData.accountType
      ),
    [accountConfigurations, formData.accountType]
  );

  const fetchAccountConfigurations = async () => {
    try {
      const res = await userApi.get("/get-account-types");
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
        apiGroup: selectedConfig.apiGroup || "",
      }));
    }
  }, [selectedConfig]);

  useEffect(() => {
    if (filteredPlatformData?.length === 1) {
      setFormData((prev) => ({
        ...prev,
        platform: filteredPlatformData[0]?.name || "",
      }));
    }
  }, [filteredPlatformData]);

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
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const createAccountHandler = async () => {
    if (creatingLoading) return;

    if (!loggedUser?._id) return toast.error("Please sign in first.");
    if (!formData.accountType) return toast.error("Select an account type.");
    if (!formData.leverage) return toast.error("Select leverage.");
    if (!formData.platform) return toast.error("Choose a platform.");

    setCreatingLoading(true);
    const toastId = toast.loading("Creating your account...");

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
        toast.success("Account created successfully!", { id: toastId });
        dispatch(setLoggedUser(response.data.user));
        getUpdateLoggedUser?.();
        navigate("/user/challenges");
      } else {
        toast.error(response?.data?.message || "Failed to create account", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while creating the account.", {
        id: toastId,
      });
    } finally {
      setCreatingLoading(false);
    }
  };

  const iconAccent = {
    color: isDark
      ? rgba(theme?.accent || "96 165 250", 0.95)
      : "rgba(249,115,22,0.95)",
  };

  const mutedTextColor = isDark
    ? rgba(theme?.fg || "255 255 255", 0.62)
    : "rgba(100,116,139,0.96)";

  const titleColor = isDark
    ? rgba(theme?.fg || "255 255 255", 0.96)
    : "rgba(15,23,42,0.98)";

  const selectStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "16px",
    padding: "13px 42px 13px 14px",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.92)",
    color: isDark ? rgba(theme?.fg || "255 255 255", 0.92) : "rgba(30,41,59,0.96)",
    border: isDark
      ? `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`
      : "1px solid rgba(251,146,60,0.16)",
  };

  const optionStyle: React.CSSProperties = {
    background: isDark ? "#111827" : "#ffffff",
    color: isDark ? "#ffffff" : "#0f172a",
  };

  const primaryButtonStyle: React.CSSProperties = {
    borderRadius: "999px",
    color: "#fff",
    background: isDark
      ? "linear-gradient(90deg, rgba(59,130,246,0.95), rgba(34,211,238,0.9))"
      : "linear-gradient(90deg, rgba(249,115,22,0.96), rgba(251,146,60,0.92))",
    boxShadow: isDark
      ? "0 14px 34px rgba(59,130,246,0.22)"
      : "0 14px 34px rgba(249,115,22,0.18)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
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
            <Sparkles className="h-4 w-4" style={iconAccent} />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: mutedTextColor }}
            >
              accounts · mt5 · setup
            </span>
          </div>

         <h1
  className="text-3xl font-bold sm:text-4xl"
  style={{
    color: titleColor,
    fontFamily: "'Poppins', sans-serif",
  }}
>
  Open MT5 Account
</h1>

          <p className="mt-2 text-sm sm:text-[15px]" style={{ color: mutedTextColor }}>
            Pick your account type, leverage, and platform to create a new
            trading account.
          </p>
        </div>

        <div className="p-4 sm:p-5 md:p-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SectionCard theme={theme} isDark={isDark} className="p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label
                      className="mb-2 flex items-center gap-2 text-sm font-semibold"
                      style={{ color: titleColor }}
                    >
                      <Coins className="h-4 w-4" style={iconAccent} />
                      1. Choose Account Type
                    </label>

                    <div className="relative">
                      <select
                        name="accountType"
                        value={formData.accountType}
                        onChange={handleInputChange}
                        style={selectStyle}
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
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                        style={{ color: mutedTextColor }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="mb-2 flex items-center gap-2 text-sm font-semibold"
                      style={{ color: titleColor }}
                    >
                      <ShieldCheck className="h-4 w-4" style={iconAccent} />
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
                          opacity: !selectedConfig?.leverage?.length ? 0.6 : 1,
                          cursor: !selectedConfig?.leverage?.length
                            ? "not-allowed"
                            : "pointer",
                        }}
                      >
                        <option value="" disabled style={optionStyle}>
                          {selectedConfig?.leverage?.length
                            ? "Select Leverage"
                            : "Select account type first"}
                        </option>

                        {selectedConfig?.leverage?.map((item: any) => (
                          <option
                            key={item.value}
                            value={item.value}
                            style={optionStyle}
                          >
                            {item.label}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                        style={{ color: mutedTextColor }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-7">
                  <label
                    className="mb-3 flex items-center gap-2 text-sm font-semibold"
                    style={{ color: titleColor }}
                  >
                    <Cpu className="h-4 w-4" style={iconAccent} />
                    3. Choose Your Platform
                  </label>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <AnimatePresence initial={false}>
                      {filteredPlatformData?.map((platform: any, index: number) => {
                        const active = formData.platform === platform.name;

                        return (
                          <motion.button
                            key={platform.name}
                            type="button"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                platform: platform.name,
                              }))
                            }
                            className="rounded-2xl border px-4 py-4 transition-all duration-300"
                            style={{
                              borderColor: active
                                ? isDark
                                  ? "rgba(96,165,250,0.35)"
                                  : "rgba(249,115,22,0.28)"
                                : isDark
                                ? rgba(theme?.border || "255 255 255", 0.1)
                                : "rgba(251,146,60,0.14)",
                              background: active
                                ? isDark
                                  ? "rgba(59,130,246,0.10)"
                                  : "rgba(255,237,213,0.72)"
                                : isDark
                                ? "rgba(255,255,255,0.02)"
                                : "rgba(255,255,255,0.82)",
                              boxShadow: active
                                ? isDark
                                  ? "0 0 0 1px rgba(96,165,250,0.18)"
                                  : "0 0 0 1px rgba(249,115,22,0.14)"
                                : "none",
                            }}
                          >
                            <div className="flex flex-col items-center justify-center gap-2 text-center">
                              <span className="text-2xl">{platform.logo ?? "🧭"}</span>
                              <span
                                className="text-sm font-semibold"
                                style={{
                                  color: active
                                    ? isDark
                                      ? "rgba(191,219,254,0.96)"
                                      : "rgba(194,65,12,0.96)"
                                    : titleColor,
                                }}
                              >
                                {platform.name}
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-8 flex justify-center sm:justify-start">
                  <motion.button
                    type="button"
                    whileHover={{ scale: creatingLoading ? 1 : 1.02 }}
                    whileTap={{ scale: creatingLoading ? 1 : 0.98 }}
                    onClick={createAccountHandler}
                    disabled={creatingLoading}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold"
                    style={{
                      ...primaryButtonStyle,
                      opacity: creatingLoading ? 0.65 : 1,
                      cursor: creatingLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    <Zap className="h-4 w-4" />
                    {creatingLoading ? "Creating..." : "Create Account"}
                  </motion.button>
                </div>
              </SectionCard>
            </div>

            <div className="lg:col-span-5">
              <SectionCard theme={theme} isDark={isDark} className="p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" style={iconAccent} />
                  <h3 className="text-lg font-semibold" style={{ color: titleColor }}>
                    Review & Summary
                  </h3>
                </div>

                <div className="space-y-3">
                  <SummaryRow
                    label="Account Type"
                    value={formData.accountType || "—"}
                    theme={theme}
                    isDark={isDark}
                  />
                  <SummaryRow
                    label="Leverage"
                    value={formData.leverage || "—"}
                    theme={theme}
                    isDark={isDark}
                  />
                  <SummaryRow
                    label="Platform"
                    value={formData.platform || "—"}
                    theme={theme}
                    isDark={isDark}
                  />
                  <SummaryRow
                    label="Server Name"
                    value={siteConfig?.serverName || "—"}
                    theme={theme}
                    isDark={isDark}
                  />
                </div>

                <div
                  className="mt-5 rounded-2xl border px-4 py-3 text-xs leading-5"
                  style={{
                    borderColor: isDark
                      ? rgba(theme?.border || "255 255 255", 0.1)
                      : "rgba(251,146,60,0.14)",
                    background: isDark
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(255,255,255,0.72)",
                    color: mutedTextColor,
                  }}
                >
                  By creating an account, you agree to the trading terms and
                  risk disclosure.
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </SectionCard>
    </motion.div>
  );
}