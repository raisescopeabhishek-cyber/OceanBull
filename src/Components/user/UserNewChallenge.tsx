import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Coins,
  ShieldCheck,
  Cpu,
  Zap,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  closeNewChallengeModal,
  setLoggedUser,
} from "../../redux/user/userSlice";
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

const rgba = (v: any, a = 1) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

function SmallChip({
  label,
  active,
  onClick,
  isDark,
  theme,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  isDark: boolean;
  theme: any;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="rounded-full border px-3 py-2 text-[11px] font-medium transition-all duration-200"
      style={{
        borderColor: active
          ? isDark
            ? "rgba(96,165,250,0.30)"
            : "rgba(249,115,22,0.24)"
          : isDark
          ? rgba(theme?.border || "255 255 255", 0.08)
          : "rgba(251,146,60,0.12)",
        background: active
          ? isDark
            ? "rgba(59,130,246,0.12)"
            : "rgba(249,115,22,0.10)"
          : isDark
          ? "rgba(255,255,255,0.02)"
          : "rgba(255,255,255,0.86)",
        color: active
          ? isDark
            ? "rgba(224,242,254,0.98)"
            : "rgba(194,65,12,0.96)"
          : isDark
          ? rgba(theme?.fg || "255 255 255", 0.88)
          : "rgba(30,41,59,0.96)",
      }}
    >
      {label}
    </motion.button>
  );
}

function SectionLabel({
  icon,
  title,
  isDark,
  theme,
}: {
  icon: React.ReactNode;
  title: string;
  isDark: boolean;
  theme: any;
}) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-xl"
        style={{
          background: isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(249,115,22,0.08)",
          color: isDark
            ? rgba(theme?.accent || "96 165 250", 0.95)
            : "rgba(249,115,22,0.95)",
        }}
      >
        {icon}
      </div>

      <span
        className="text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{
          color: isDark
            ? rgba(theme?.fg || "255 255 255", 0.58)
            : "rgba(100,116,139,0.95)",
        }}
      >
        {title}
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
  const isOpen = useSelector(
    (state: any) => state.user?.isNewChallengeModalOpen
  );
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
    if (!isOpen) return;
    getPlatforms();
    getPaymentMethod();
    fetchAccountConfigurations();
  }, [isOpen]);

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

  const handleClose = () => {
    if (creatingLoading) return;
    dispatch(closeNewChallengeModal());
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
        dispatch(closeNewChallengeModal());
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

  const titleColor = isDark
    ? rgba(theme?.fg || "255 255 255", 0.96)
    : "rgba(15,23,42,0.98)";

  const mutedText = isDark
    ? rgba(theme?.fg || "255 255 255", 0.58)
    : "rgba(100,116,139,0.95)";

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key="new-challenge-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5"
          style={{
            background: "rgba(37, 99, 235, 0.28)",
            backdropFilter: "blur(8px)",
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl rounded-[26px] border"
            style={{
              borderColor: isDark
                ? rgba(theme?.border || "255 255 255", 0.08)
                : "rgba(251,146,60,0.14)",
              background: isDark
                ? "linear-gradient(180deg, rgba(15,23,42,0.97), rgba(2,6,23,0.98))"
                : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,248,243,0.97))",
              boxShadow: isDark
                ? "0 24px 60px rgba(0,0,0,0.35)"
                : "0 24px 60px rgba(37,99,235,0.16)",
            }}
          >
            {/* header */}
            <div
              className="flex items-start justify-between gap-3 border-b px-4 py-3 sm:px-5"
              style={{
                borderColor: isDark
                  ? rgba(theme?.border || "255 255 255", 0.08)
                  : "rgba(251,146,60,0.10)",
              }}
            >
              <div>
                <h2
                  className="text-sm font-semibold sm:text-[15px]"
                  style={{
                    color: titleColor,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Open MT5 Account
                </h2>
                <p className="mt-1 text-[10px] sm:text-[11px]" style={{ color: mutedText }}>
                  Select details and create your account.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl border transition-all"
                style={{
                  borderColor: isDark
                    ? rgba(theme?.border || "255 255 255", 0.08)
                    : "rgba(251,146,60,0.12)",
                  background: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(255,255,255,0.85)",
                  color: mutedText,
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* body */}
            <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_0.9fr]">
                <div className="space-y-4">
                  <div>
                    <SectionLabel
                      icon={<Coins className="h-3.5 w-3.5" />}
                      title="Account Type"
                      isDark={isDark}
                      theme={theme}
                    />
                    <div className="flex flex-wrap gap-2">
                      {accountConfigurations?.map((item: any) => (
                        <SmallChip
                          key={item.accountType}
                          label={item.accountType}
                          active={formData.accountType === item.accountType}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              accountType: item.accountType,
                              apiGroup: item.apiGroup || "",
                              leverage: item?.leverage?.[0]?.value || "",
                            }))
                          }
                          isDark={isDark}
                          theme={theme}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <SectionLabel
                      icon={<ShieldCheck className="h-3.5 w-3.5" />}
                      title="Leverage"
                      isDark={isDark}
                      theme={theme}
                    />
                    <div className="flex flex-wrap gap-2">
                      {selectedConfig?.leverage?.length ? (
                        selectedConfig.leverage.map((item: any) => (
                          <SmallChip
                            key={item.value}
                            label={item.label}
                            active={formData.leverage === item.value}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                leverage: item.value,
                              }))
                            }
                            isDark={isDark}
                            theme={theme}
                          />
                        ))
                      ) : (
                        <div
                          className="rounded-full border px-3 py-2 text-[11px]"
                          style={{
                            borderColor: isDark
                              ? rgba(theme?.border || "255 255 255", 0.08)
                              : "rgba(251,146,60,0.12)",
                            background: isDark
                              ? "rgba(255,255,255,0.02)"
                              : "rgba(255,255,255,0.84)",
                            color: mutedText,
                          }}
                        >
                          Select account type first
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <SectionLabel
                    icon={<Cpu className="h-3.5 w-3.5" />}
                    title="Platform"
                    isDark={isDark}
                    theme={theme}
                  />

                  <div className="space-y-2">
                    {filteredPlatformData?.map((platform: any) => {
                      const active = formData.platform === platform.name;

                      return (
                        <motion.button
                          key={platform.name}
                          type="button"
                          whileTap={{ scale: 0.985 }}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              platform: platform.name,
                            }))
                          }
                          className="flex w-full items-center justify-between rounded-[16px] border px-3 py-3 text-left transition-all duration-200"
                          style={{
                            borderColor: active
                              ? isDark
                                ? "rgba(96,165,250,0.28)"
                                : "rgba(249,115,22,0.22)"
                              : isDark
                              ? rgba(theme?.border || "255 255 255", 0.08)
                              : "rgba(251,146,60,0.12)",
                            background: active
                              ? isDark
                                ? "rgba(59,130,246,0.10)"
                                : "rgba(249,115,22,0.08)"
                              : isDark
                              ? "rgba(255,255,255,0.02)"
                              : "rgba(255,255,255,0.86)",
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-sm"
                              style={{
                                background: isDark
                                  ? "rgba(255,255,255,0.05)"
                                  : "rgba(249,115,22,0.06)",
                              }}
                            >
                              {platform.logo ?? "🧭"}
                            </div>

                            <div>
                              <div
                                className="text-xs font-semibold"
                                style={{
                                  color: active
                                    ? isDark
                                      ? "rgba(224,242,254,0.96)"
                                      : "rgba(194,65,12,0.96)"
                                    : titleColor,
                                }}
                              >
                                {platform.name}
                              </div>
                              <div className="text-[10px]" style={{ color: mutedText }}>
                                Platform
                              </div>
                            </div>
                          </div>

                          {active ? (
                            <Check
                              className="h-4 w-4"
                              style={{
                                color: isDark
                                  ? "rgba(125,211,252,0.96)"
                                  : "rgba(249,115,22,0.95)",
                              }}
                            />
                          ) : null}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[18px] border px-3 py-3"
                style={{
                  borderColor: isDark
                    ? rgba(theme?.border || "255 255 255", 0.08)
                    : "rgba(251,146,60,0.12)",
                  background: isDark
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(255,255,255,0.78)",
                }}
              >
                <span className="text-[10px] font-medium" style={{ color: mutedText }}>
                  Type: <span style={{ color: titleColor }}>{formData.accountType || "—"}</span>
                </span>
                <span className="text-[10px] font-medium" style={{ color: mutedText }}>
                  Leverage: <span style={{ color: titleColor }}>{formData.leverage || "—"}</span>
                </span>
                <span className="text-[10px] font-medium" style={{ color: mutedText }}>
                  Platform: <span style={{ color: titleColor }}>{formData.platform || "—"}</span>
                </span>
                <span className="text-[10px] font-medium" style={{ color: mutedText }}>
                  Server: <span style={{ color: titleColor }}>{siteConfig?.serverName || "—"}</span>
                </span>
              </div>

              <div>
                <motion.button
                  type="button"
                  whileHover={{ scale: creatingLoading ? 1 : 1.01 }}
                  whileTap={{ scale: creatingLoading ? 1 : 0.985 }}
                  onClick={createAccountHandler}
                  disabled={creatingLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-semibold text-white"
                  style={{
                    background: isDark
                      ? "linear-gradient(90deg, rgba(59,130,246,0.95), rgba(34,211,238,0.9))"
                      : "linear-gradient(90deg, rgba(249,115,22,0.96), rgba(251,146,60,0.92))",
                    boxShadow: isDark
                      ? "0 12px 28px rgba(59,130,246,0.18)"
                      : "0 12px 28px rgba(249,115,22,0.14)",
                    opacity: creatingLoading ? 0.65 : 1,
                    cursor: creatingLoading ? "not-allowed" : "pointer",
                  }}
                >
                  <Zap className="h-3.5 w-3.5" />
                  {creatingLoading ? "Creating..." : "Create Account"}
                </motion.button>

                <p
                  className="mt-2 text-center text-[10px] leading-4"
                  style={{ color: mutedText }}
                >
                  By creating an account, you agree to the trading terms and risk disclosure.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}