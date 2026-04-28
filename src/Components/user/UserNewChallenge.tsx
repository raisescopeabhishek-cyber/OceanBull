import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Coins,
  ShieldCheck,
  Cpu,
  Zap,
  Check,
  X,
  Sparkles,
  Server,
  Loader2,
  BadgeCheck,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
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

const getTheme = (isDark: boolean, theme: any) => ({
  overlay: isDark ? "rgba(2,6,23,0.74)" : "rgba(249,115,22,0.22)",

  modalBg: isDark
    ? "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(2,6,23,0.98))"
    : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,247,237,0.98))",

  headerBg: isDark
    ? "linear-gradient(135deg, rgba(30,41,59,1), rgba(15,23,42,1))"
    : "linear-gradient(135deg, #f97316, #ea580c)",

  surface: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.86)",
  surfaceSoft: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,237,213,0.62)",
  activeSurface: isDark ? "rgba(59,130,246,0.11)" : "rgba(249,115,22,0.10)",

  text: isDark ? rgba(theme?.fg || "255 255 255", 0.96) : "#0f172a",
  muted: isDark ? rgba(theme?.fg || "255 255 255", 0.58) : "#64748b",
  softText: isDark ? rgba(theme?.fg || "255 255 255", 0.74) : "#475569",

  accent: isDark ? rgba(theme?.accent || "96 165 250", 0.95) : "#f97316",
  accentText: isDark ? "rgba(224,242,254,0.98)" : "#c2410c",

  border: isDark
    ? rgba(theme?.border || "255 255 255", 0.1)
    : "rgba(249,115,22,0.20)",
  borderSoft: isDark
    ? rgba(theme?.border || "255 255 255", 0.08)
    : "rgba(249,115,22,0.14)",
  activeBorder: isDark ? "rgba(96,165,250,0.30)" : "rgba(249,115,22,0.46)",

  inputShadow: isDark
    ? "0 0 0 1px rgba(255,255,255,0.03)"
    : "0 0 0 4px rgba(249,115,22,0.10), 0 12px 28px rgba(249,115,22,0.12)",

  modalShadow: isDark
    ? "0 28px 80px rgba(0,0,0,0.48)"
    : "0 28px 80px rgba(249,115,22,0.22)",

  cardShadow: isDark
    ? "0 16px 36px rgba(0,0,0,0.22)"
    : "0 14px 32px rgba(249,115,22,0.10)",

  button: isDark
    ? "linear-gradient(90deg, rgba(59,130,246,0.96), rgba(34,211,238,0.90))"
    : "linear-gradient(90deg, #f97316, #ea580c)",

  buttonShadow: isDark
    ? "0 14px 30px rgba(59,130,246,0.20)"
    : "0 14px 30px rgba(249,115,22,0.28)",
});

const GUIDE_STORAGE_KEY = "user_new_challenge_arrow_guide_seen";

const getGuideSeen = () => {
  try {
    return localStorage.getItem(GUIDE_STORAGE_KEY) === "true";
  } catch {
    return true;
  }
};

const markGuideSeen = () => {
  try {
    localStorage.setItem(GUIDE_STORAGE_KEY, "true");
  } catch {
    // localStorage can be blocked in private mode
  }
};

type GuideTarget = "accountType" | "leverage" | "platform" | "createButton";

function HeaderStat({
  icon,
  label,
  value,
  colors,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 text-white backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-white/10">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-[10px] text-white/70">{label}</div>
          <div className="truncate text-xs font-bold text-white">{value}</div>
        </div>
      </div>
    </div>
  );
}

function SmallChip({
  label,
  active,
  onClick,
  colors,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  colors: any;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="rounded-2xl border px-4 py-2.5 text-xs font-semibold transition-all duration-200"
      style={{
        borderColor: active ? colors.activeBorder : colors.border,
        background: active ? colors.activeSurface : colors.surface,
        color: active ? colors.accentText : colors.text,
        boxShadow: active && !colors.isDark ? colors.inputShadow : "none",
      }}
    >
      <span className="inline-flex items-center gap-2">
        {active ? <Check className="h-3.5 w-3.5" /> : null}
        {label}
      </span>
    </motion.button>
  );
}

function SectionLabel({
  icon,
  title,
  colors,
}: {
  icon: React.ReactNode;
  title: string;
  colors: any;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-xl border"
        style={{
          borderColor: colors.border,
          background: colors.activeSurface,
          color: colors.accent,
        }}
      >
        {icon}
      </div>

      <span
        className="text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: colors.muted }}
      >
        {title}
      </span>
    </div>
  );
}

function EmptyOption({ text, colors }: { text: string; colors: any }) {
  return (
    <div
      className="rounded-2xl border px-4 py-3 text-xs"
      style={{
        borderColor: colors.border,
        background: colors.surface,
        color: colors.muted,
      }}
    >
      {text}
    </div>
  );
}

function GuideBubble({
  step,
  index,
  total,
  targetRect,
  colors,
  onBack,
  onNext,
  onSkip,
}: {
  step: {
    title: string;
    description: string;
    target: GuideTarget;
  };
  index: number;
  total: number;
  targetRect: DOMRect | null;
  colors: any;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const bubbleWidth =
    typeof window !== "undefined"
      ? Math.min(window.innerWidth - 32, 360)
      : 340;

  const bubbleHeight = 190;
  const gap = 16;

  let placement: "top" | "bottom" = "bottom";
  let top = 120;
  let left =
    typeof window !== "undefined" ? window.innerWidth / 2 - bubbleWidth / 2 : 24;

  if (targetRect && typeof window !== "undefined") {
    top = targetRect.bottom + gap;
    left = targetRect.left + targetRect.width / 2 - bubbleWidth / 2;

    if (top + bubbleHeight > window.innerHeight - 16) {
      placement = "top";
      top = targetRect.top - bubbleHeight - gap;
    }

    left = Math.max(16, Math.min(left, window.innerWidth - bubbleWidth - 16));
    top = Math.max(16, top);
  }

  const arrowLeft = targetRect
    ? Math.max(
        22,
        Math.min(
          targetRect.left + targetRect.width / 2 - left - 8,
          bubbleWidth - 34
        )
      )
    : bubbleWidth / 2 - 8;

  const isLast = index === total - 1;

  return (
    <motion.div
      key={step.title}
      initial={{ opacity: 0, y: placement === "bottom" ? -8 : 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: placement === "bottom" ? -8 : 8, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className="fixed z-[10050] rounded-[22px] border p-4"
      style={{
        width: bubbleWidth,
        top,
        left,
        borderColor: colors.activeBorder,
        background: colors.isDark
          ? "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(2,6,23,0.98))"
          : "linear-gradient(180deg, rgba(255,255,255,0.99), rgba(255,247,237,0.99))",
        boxShadow: colors.isDark
          ? "0 24px 60px rgba(0,0,0,0.46)"
          : "0 24px 60px rgba(249,115,22,0.24)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <span
        className="absolute h-4 w-4 rotate-45 border"
        style={{
          left: arrowLeft,
          top: placement === "bottom" ? -8 : "auto",
          bottom: placement === "top" ? -8 : "auto",
          borderColor:
            placement === "bottom"
              ? `${colors.activeBorder} transparent transparent ${colors.activeBorder}`
              : `transparent ${colors.activeBorder} ${colors.activeBorder} transparent`,
          background: colors.isDark ? "rgba(15,23,42,0.98)" : "#fff7ed",
        }}
      />

      <div className="mb-2 flex items-center justify-between gap-3">
        <div
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{
            borderColor: colors.activeBorder,
            background: colors.activeSurface,
            color: colors.accentText,
          }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Guide {index + 1}/{total}
        </div>

        <button
          type="button"
          onClick={onSkip}
          className="rounded-full p-1.5 transition-all hover:opacity-80"
          style={{ color: colors.muted }}
          aria-label="Skip guide"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <h3 className="text-base font-black" style={{ color: colors.text }}>
        {step.title}
      </h3>

      <p className="mt-2 text-xs leading-5" style={{ color: colors.muted }}>
        {step.description}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={index === 0}
          className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-45"
          style={{
            borderColor: colors.border,
            background: colors.surface,
            color: colors.text,
          }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold text-white transition-all"
          style={{
            background: colors.button,
            boxShadow: colors.buttonShadow,
          }}
        >
          {isLast ? "Finish" : "Next"}
          {!isLast ? <ArrowRight className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
        </button>
      </div>
    </motion.div>
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

  const colors = useMemo(() => {
    const base = getTheme(isDark, theme);
    return { ...base, isDark };
  }, [isDark, theme]);

  const { getPlatforms, getPaymentMethod } = UserNewChallengeHook();
  const { getUpdateLoggedUser } = UseUserHook();

  const accountTypeRef = useRef<HTMLDivElement | null>(null);
  const leverageRef = useRef<HTMLDivElement | null>(null);
  const platformRef = useRef<HTMLDivElement | null>(null);
  const createButtonRef = useRef<HTMLDivElement | null>(null);

  const [accountConfigurations, setAccountConfigurations] = useState<any[]>([]);
  const [creatingLoading, setCreatingLoading] = useState(false);

  const [showGuide, setShowGuide] = useState(false);
  const [guideStepIndex, setGuideStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const [formData, setFormData] = useState({
    accountType: "",
    apiGroup: "",
    platform: "",
    leverage: "",
  });

const guideSteps = useMemo(
  () => [
    {
      target: "accountType" as GuideTarget,
      title: "First, select an account type",
      description:
        "Choose the account type you want to create. This selection will decide the group configuration and available leverage options.",
    },
    {
      target: "leverage" as GuideTarget,
      title: "Next, choose leverage",
      description:
        "After selecting an account type, choose one of the available leverage options. Leverage selection is required before account creation.",
    },
    {
      target: "platform" as GuideTarget,
      title: "Select a trading platform",
      description:
        "Choose the active trading platform where the account should be created. If only one platform is active, it will be selected automatically.",
    },
    {
      target: "createButton" as GuideTarget,
      title: "Create your trading account",
      description:
        "Once account type, leverage, and platform are selected, click the Create Trading Account button to complete the setup.",
    },
  ],
  []
);

  const currentGuideStep = guideSteps[guideStepIndex];

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

  const createEnabled =
    !!loggedUser?._id &&
    !!formData.accountType &&
    !!formData.leverage &&
    !!formData.platform &&
    !creatingLoading;

  const getTargetElement = (target: GuideTarget) => {
    const refs = {
      accountType: accountTypeRef,
      leverage: leverageRef,
      platform: platformRef,
      createButton: createButtonRef,
    };

    return refs[target]?.current || null;
  };

  const updateGuidePosition = () => {
    if (!showGuide || !currentGuideStep) return;

    const el = getTargetElement(currentGuideStep.target);
    if (!el) return;

    setTargetRect(el.getBoundingClientRect());
  };

  const focusGuideTarget = () => {
    const el = getTargetElement(currentGuideStep.target);
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });

    window.setTimeout(() => {
      setTargetRect(el.getBoundingClientRect());
    }, 260);
  };

  const getHighlightStyle = (target: GuideTarget) => {
    const active = showGuide && currentGuideStep?.target === target;

    if (!active) return {};

    return {
      position: "relative" as const,
      zIndex: 20,
      borderColor: colors.activeBorder,
      boxShadow: `${colors.cardShadow}, 0 0 0 4px ${colors.activeBorder}, 0 0 0 9px ${colors.activeSurface}`,
    };
  };

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

    if (!getGuideSeen()) {
      setGuideStepIndex(0);
      setShowGuide(true);
    }
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

  useEffect(() => {
    if (!showGuide || !isOpen) return;

    focusGuideTarget();

    const onResize = () => updateGuidePosition();
    const onScroll = () => updateGuidePosition();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [showGuide, guideStepIndex, isOpen]);

  const handleClose = () => {
    if (creatingLoading) return;
    dispatch(closeNewChallengeModal());
  };

  const openGuide = () => {
    if (creatingLoading) return;
    setGuideStepIndex(0);
    setShowGuide(true);
  };

  const skipGuide = () => {
    markGuideSeen();
    setShowGuide(false);
    setGuideStepIndex(0);
    setTargetRect(null);
  };

  const nextGuideStep = () => {
    if (guideStepIndex >= guideSteps.length - 1) {
      skipGuide();
      return;
    }

    setGuideStepIndex((prev) => prev + 1);
  };

  const prevGuideStep = () => {
    setGuideStepIndex((prev) => Math.max(prev - 1, 0));
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
            background: colors.overlay,
            backdropFilter: "blur(9px)",
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-[26px] border"
            style={{
              borderColor: colors.border,
              background: colors.modalBg,
              boxShadow: colors.modalShadow,
            }}
          >
            {/* header */}
            <div
              className="relative overflow-hidden px-5 py-5 sm:px-6"
              style={{
                background: colors.headerBg,
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 32%), radial-gradient(circle at bottom right, rgba(255,237,213,0.18), transparent 38%)",
                }}
              />

              <div className="relative z-[1]">
                <div className="mb-4 flex items-center justify-end gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={openGuide}
                    disabled={creatingLoading}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur-xl transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    Guide
                  </motion.button>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={handleClose}
                    disabled={creatingLoading}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-xl transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
                      <Zap className="h-6 w-6" />
                    </div>

                    <div>
                      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                        <Sparkles className="h-3.5 w-3.5" />
                        Trading Account Setup
                      </div>

                      <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Create Trading Account
                      </h2>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                        Select account type, leverage, and platform to open your
                        MT5 account.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[470px]">
                    <HeaderStat
                      colors={colors}
                      icon={<Coins className="h-4 w-4" />}
                      label="Type"
                      value={formData.accountType || "Select"}
                    />
                    <HeaderStat
                      colors={colors}
                      icon={<ShieldCheck className="h-4 w-4" />}
                      label="Leverage"
                      value={formData.leverage || "Select"}
                    />
                    <HeaderStat
                      colors={colors}
                      icon={<Cpu className="h-4 w-4" />}
                      label="Platform"
                      value={formData.platform || "Select"}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* body */}
            <div className="max-h-[calc(94vh-190px)] space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_0.92fr]">
                <div
                  className="rounded-[22px] border p-4 sm:p-5"
                  style={{
                    borderColor: colors.border,
                    background: colors.surface,
                    boxShadow: colors.cardShadow,
                  }}
                >
                  <div className="space-y-6">
                    <div
                      ref={accountTypeRef}
                      className="rounded-[18px] p-2 transition-all duration-200"
                      style={getHighlightStyle("accountType")}
                    >
                      <SectionLabel
                        icon={<Coins className="h-3.5 w-3.5" />}
                        title="Account Type"
                        colors={colors}
                      />

                      {accountConfigurations?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {accountConfigurations.map((item: any) => (
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
                              colors={colors}
                            />
                          ))}
                        </div>
                      ) : (
                        <EmptyOption
                          text="No active account types found"
                          colors={colors}
                        />
                      )}
                    </div>

                    <div
                      ref={leverageRef}
                      className="rounded-[18px] p-2 transition-all duration-200"
                      style={getHighlightStyle("leverage")}
                    >
                      <SectionLabel
                        icon={<ShieldCheck className="h-3.5 w-3.5" />}
                        title="Leverage"
                        colors={colors}
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
                              colors={colors}
                            />
                          ))
                        ) : (
                          <EmptyOption
                            text="Select account type first"
                            colors={colors}
                          />
                        )}
                      </div>
                    </div>

                    <div
                      className="rounded-[18px] border px-4 py-3"
                      style={{
                        borderColor: colors.border,
                        background: colors.surfaceSoft,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                          style={{
                            borderColor: colors.activeBorder,
                            background: colors.activeSurface,
                            color: colors.accent,
                          }}
                        >
                          <BadgeCheck className="h-5 w-5" />
                        </div>

                        <div>
                          <div
                            className="text-sm font-semibold"
                            style={{ color: colors.text }}
                          >
                            Account setup is instant
                          </div>
                          <p
                            className="mt-1 text-xs leading-5"
                            style={{ color: colors.muted }}
                          >
                            Your selected configuration will be used to create a
                            trading account. You can deposit funds after account
                            creation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  ref={platformRef}
                  className="rounded-[22px] border p-4 transition-all duration-200 sm:p-5"
                  style={{
                    borderColor: colors.border,
                    background: colors.surface,
                    boxShadow: colors.cardShadow,
                    ...getHighlightStyle("platform"),
                  }}
                >
                  <SectionLabel
                    icon={<Cpu className="h-3.5 w-3.5" />}
                    title="Platform"
                    colors={colors}
                  />

                  <div className="space-y-3">
                    {filteredPlatformData?.length ? (
                      filteredPlatformData.map((platform: any) => {
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
                            className="flex w-full items-center justify-between rounded-[18px] border px-4 py-4 text-left transition-all duration-200"
                            style={{
                              borderColor: active
                                ? colors.activeBorder
                                : colors.border,
                              background: active
                                ? colors.activeSurface
                                : colors.surfaceSoft,
                              boxShadow:
                                active && !isDark ? colors.inputShadow : "none",
                            }}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm"
                                style={{
                                  borderColor: active
                                    ? colors.activeBorder
                                    : colors.border,
                                  background: colors.surface,
                                  color: colors.accent,
                                }}
                              >
                                {platform.logo ?? "🧭"}
                              </div>

                              <div className="min-w-0">
                                <div
                                  className="truncate text-sm font-semibold"
                                  style={{
                                    color: active
                                      ? colors.accentText
                                      : colors.text,
                                  }}
                                >
                                  {platform.name}
                                </div>
                                <div
                                  className="mt-1 text-xs"
                                  style={{ color: colors.muted }}
                                >
                                  Active trading platform
                                </div>
                              </div>
                            </div>

                            {active ? (
                              <Check
                                className="h-4 w-4 shrink-0"
                                style={{ color: colors.accent }}
                              />
                            ) : null}
                          </motion.button>
                        );
                      })
                    ) : (
                      <EmptyOption
                        text="No active platform found"
                        colors={colors}
                      />
                    )}
                  </div>

                  <div
                    className="mt-5 rounded-[18px] border px-4 py-3"
                    style={{
                      borderColor: colors.border,
                      background: colors.surfaceSoft,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                        style={{
                          borderColor: colors.activeBorder,
                          background: colors.activeSurface,
                          color: colors.accent,
                        }}
                      >
                        <Server className="h-5 w-5" />
                      </div>

                      <div>
                        <div
                          className="text-sm font-semibold"
                          style={{ color: colors.text }}
                        >
                          Server Details
                        </div>
                        <p
                          className="mt-1 text-xs"
                          style={{ color: colors.muted }}
                        >
                          Server:{" "}
                          <span
                            className="font-semibold"
                            style={{ color: colors.text }}
                          >
                            {siteConfig?.serverName || "Not configured"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* footer */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5" style={{ color: colors.muted }}>
                  By creating an account, you agree to the trading terms and risk
                  disclosure.
                </p>

                <div
                  ref={createButtonRef}
                  className="rounded-[20px] transition-all duration-200"
                  style={getHighlightStyle("createButton")}
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: createEnabled ? 1.01 : 1 }}
                    whileTap={{ scale: createEnabled ? 0.985 : 1 }}
                    onClick={createAccountHandler}
                    disabled={!createEnabled}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3 text-sm font-bold text-white transition-all disabled:cursor-not-allowed"
                    style={{
                      background: colors.button,
                      boxShadow: colors.buttonShadow,
                      opacity: createEnabled ? 1 : 0.62,
                      minWidth: "230px",
                    }}
                  >
                    {creatingLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    {creatingLoading
                      ? "Creating Account..."
                      : "Create Trading Account"}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {showGuide && currentGuideStep ? (
              <GuideBubble
                step={currentGuideStep}
                index={guideStepIndex}
                total={guideSteps.length}
                targetRect={targetRect}
                colors={colors}
                onBack={prevGuideStep}
                onNext={nextGuideStep}
                onSkip={skipGuide}
              />
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}