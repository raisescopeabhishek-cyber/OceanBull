import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  BookOpenIcon,
  ChevronDown,
  ChevronUp,
  Loader2,
  Shield,
  Sparkles,
  FileText,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { userApi } from "../../utils/apiClients";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const getTheme = (isDark) => ({
  pageText: isDark ? "text-white" : "text-slate-900",
  text: isDark ? "text-white" : "text-slate-900",
  mutedText: isDark ? "text-white/50" : "text-slate-500",
  softText: isDark ? "text-white/70" : "text-slate-600",

  header: isDark
    ? "border-white/10 bg-[linear-gradient(135deg,rgba(30,41,59,1),rgba(15,23,42,1))] shadow-[0_18px_55px_rgba(0,0,0,0.38)]"
    : "border-orange-300/40 bg-[linear-gradient(135deg,#f97316,#ea580c)] shadow-[0_18px_45px_rgba(249,115,22,0.22)]",

  headerText: "text-white",
  headerMuted: isDark ? "text-white/65" : "text-white/80",
  headerBadge: "border-white/20 bg-white/10 text-white",
  headerIcon: "border-white/20 bg-white/10 text-white",
  headerStat: "border-white/20 bg-white/10 text-white backdrop-blur-xl",
  headerStatMuted: "text-white/75",

  card: isDark
    ? "border-white/10 bg-white/[0.045] shadow-[0_18px_55px_rgba(0,0,0,0.38)]"
    : "border-orange-100/90 bg-white/80 shadow-[0_18px_45px_rgba(251,146,60,0.12)]",

  cardSoft: isDark
    ? "border-white/10 bg-white/[0.035]"
    : "border-orange-100/80 bg-white/70",

  iconBox: isDark
    ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
    : "border-orange-200 bg-orange-50 text-orange-600",

  iconBoxSoft: isDark
    ? "border-white/10 bg-white/[0.04] text-white/55"
    : "border-orange-100 bg-white/80 text-orange-500",

  badge: isDark
    ? "border-white/10 bg-white/[0.05] text-white/55"
    : "border-orange-100 bg-white/80 text-orange-600",

  ruleItem: isDark
    ? "border-white/10 bg-white/[0.035] hover:bg-white/[0.055]"
    : "border-orange-100 bg-white/75 hover:bg-white",

  accordion: isDark
    ? "border-white/10 bg-white/[0.035] text-white/75 hover:bg-white/[0.055]"
    : "border-orange-100 bg-white/75 text-slate-700 hover:bg-orange-50/80",

  accordionActive: isDark
    ? "border-blue-400/20 bg-blue-500/10 text-white"
    : "border-orange-300 bg-orange-50/90 text-slate-900 shadow-[0_0_0_3px_rgba(251,146,60,0.08)]",

  successBadge: isDark
    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
    : "border-emerald-200 bg-emerald-50 text-emerald-700",
});

const HeaderCard = ({ children, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: -14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className={cn(
      "relative overflow-hidden rounded-[26px] border p-5 transition-all duration-300 sm:p-6",
      theme.header
    )}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(255,255,255,0.20), transparent 30%), radial-gradient(circle at bottom right, rgba(255,237,213,0.22), transparent 36%)",
      }}
    />
    <div className="relative z-[1]">{children}</div>
  </motion.div>
);

const Card = ({ children, theme, className = "" }) => (
  <div
    className={cn(
      "rounded-[26px] border p-4 transition-all duration-300 sm:p-5",
      theme.card,
      className
    )}
  >
    {children}
  </div>
);

const HeaderIconBox = ({ children, theme }) => (
  <div
    className={cn(
      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
      theme.headerIcon
    )}
  >
    {children}
  </div>
);

const HeaderStatBox = ({ icon, label, value, theme }) => (
  <div className={cn("rounded-2xl border px-4 py-3", theme.headerStat)}>
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10">
        {icon}
      </div>

      <div className="min-w-0">
        <p className={cn("text-xs", theme.headerStatMuted)}>{label}</p>
        <p className="mt-1 truncate text-base font-bold text-white">{value}</p>
      </div>
    </div>
  </div>
);

const SectionHeader = ({ icon, title, subtitle, theme }) => (
  <div className="mb-5 flex items-start gap-3">
    <div
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
        theme.iconBox
      )}
    >
      {icon}
    </div>

    <div>
      <h2 className={cn("text-lg font-semibold", theme.text)}>{title}</h2>
      {subtitle ? (
        <p className={cn("mt-1 text-sm leading-6", theme.mutedText)}>
          {subtitle}
        </p>
      ) : null}
    </div>
  </div>
);

const DefinitionAccordion = ({
  title,
  content,
  isOpen,
  toggle,
  isDark,
  theme,
}) => {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border transition-all duration-300",
        isOpen ? theme.accordionActive : theme.accordion
      )}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left outline-none transition-all duration-200"
        onClick={toggle}
      >
        <span className="text-sm font-semibold sm:text-base">{title}</span>

        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-200",
            isOpen ? theme.iconBox : theme.iconBoxSoft
          )}
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "border-t px-4 py-4 text-sm leading-6",
                isDark
                  ? "border-white/10 bg-white/[0.03] text-white/65"
                  : "border-orange-100 bg-orange-50/60 text-slate-600"
              )}
            >
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UserRules = () => {
  const mode = useSelector(
    (store) =>
      store?.userTheme?.mode ||
      store?.adminTheme?.mode ||
      store?.theme?.mode ||
      "light"
  );

  const isDark = mode === "dark";
  const theme = useMemo(() => getTheme(isDark), [isDark]);

  const [expandedDefinition, setExpandedDefinition] = useState(
    "What is Forex Trading?"
  );
  const [visibleRules, setVisibleRules] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);

  const definitions = [
    {
      title: "What is Forex Trading?",
      content:
        "Forex trading, also known as foreign exchange trading or currency trading, is the buying and selling of currencies on the foreign exchange market with the aim of making a profit.",
    },
    {
      title: "What is a Pip?",
      content:
        "A pip, short for 'percentage in point' or 'price interest point,' is the smallest price move that an exchange rate can make based on forex market convention. Most currency pairs are priced to four decimal places and the pip is the last fourth decimal point.",
    },
    {
      title: "What is Leverage in Forex?",
      content:
        "Leverage in Forex trading allows traders to control a larger position than their initial investment, amplifying both potential gains and potential losses. It is typically expressed as a ratio, such as 100:1, meaning the trader can control $100 for every $1 in their account.",
    },
    {
      title: "What is a Currency Pair?",
      content:
        "A currency pair in Forex is a quotation of two different currencies, where the value of one currency is quoted against the other. The first currency is the base currency, and the second is the quote currency. For example, in EUR/USD, EUR is the base currency, and USD is the quote currency.",
    },
    {
      title: "What is a Stop-Loss Order?",
      content:
        "A stop-loss order is a risk management tool that allows traders to set a predefined price level at which their position will automatically be closed to limit potential losses. It helps manage risk by preventing further loss if the market moves unfavorably.",
    },
    {
      title: "What is Technical Analysis?",
      content:
        "Technical analysis is a method of evaluating price movements and trends using historical market data, such as price charts and trading volume. Forex traders use technical analysis to identify trading opportunities and forecast future currency movements.",
    },
  ];

  const activeRulesCount = useMemo(() => rules?.length || 0, [rules]);

  const toggleDefinition = (definition) => {
    setExpandedDefinition((prev) => (prev === definition ? null : definition));
  };

  const fetchRules = async () => {
    try {
      setLoading(true);

      const response = await userApi.get("/get-rules");
      const data = response?.data?.data;

      const activeRules = Array.isArray(data)
        ? data.filter((rule) => rule?.status === true)
        : [];

      setRules(activeRules);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch rules");
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTextWithLinks = (text = "") => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return String(text)
      .split(urlRegex)
      .map((part, index) => {
        const isUrl = /^https?:\/\/[^\s]+$/.test(part);

        if (isUrl) {
          return (
            <a
              key={`${part}-${index}`}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "font-semibold underline underline-offset-4 transition-colors",
                isDark
                  ? "text-blue-300 hover:text-blue-200"
                  : "text-orange-600 hover:text-orange-700"
              )}
            >
              {part}
            </a>
          );
        }

        return part;
      });
  };

  useEffect(() => {
    const timers = [];

    setVisibleRules([]);

    if (rules.length > 0) {
      rules.forEach((_, index) => {
        const timer = setTimeout(() => {
          setVisibleRules((prev) =>
            prev.includes(index) ? prev : [...prev, index]
          );
        }, index * 120);

        timers.push(timer);
      });
    }

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [rules]);

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <div className={cn("w-full space-y-5", theme.pageText)}>
      {/* Header */}
      <HeaderCard theme={theme}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <HeaderIconBox theme={theme}>
              <Shield className="h-6 w-6" />
            </HeaderIconBox>

            <div>
              <div
                className={cn(
                  "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                  theme.headerBadge
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Trading Knowledge Center
              </div>

              <h1
                className={cn(
                  "text-2xl font-bold tracking-tight sm:text-3xl",
                  theme.headerText
                )}
              >
                Rules & Definitions
              </h1>

              <p
                className={cn(
                  "mt-2 max-w-2xl text-sm leading-6",
                  theme.headerMuted
                )}
              >
                Review active platform rules and learn important forex trading terms in one clean workspace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[360px]">
            <HeaderStatBox
              theme={theme}
              icon={<FileText className="h-4 w-4" />}
              label="Active Rules"
              value={String(activeRulesCount)}
            />

            <HeaderStatBox
              theme={theme}
              icon={<BookOpenIcon className="h-4 w-4" />}
              label="Definitions"
              value={String(definitions.length)}
            />
          </div>
        </div>
      </HeaderCard>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Rules Section */}
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="xl:col-span-5"
        >
          <Card theme={theme}>
            <SectionHeader
              theme={theme}
              icon={<Shield className="h-5 w-5" />}
              title="Rules"
              subtitle="Active rules published by the platform admin."
            />

            {loading ? (
              <div
                className={cn(
                  "flex min-h-[340px] items-center justify-center rounded-3xl border",
                  theme.cardSoft
                )}
              >
                <div className="text-center">
                  <Loader2
                    className={cn(
                      "mx-auto h-9 w-9 animate-spin",
                      isDark ? "text-blue-400" : "text-orange-500"
                    )}
                  />
                  <p className={cn("mt-3 text-sm", theme.mutedText)}>
                    Loading rules...
                  </p>
                </div>
              </div>
            ) : rules?.length ? (
              <div className="space-y-3">
                {rules.map((rule, index) => (
                  <motion.div
                    key={rule?._id || index}
                    initial={{ opacity: 0, x: -18 }}
                    animate={
                      visibleRules.includes(index)
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: -18 }
                    }
                    transition={{ duration: 0.25 }}
                    className={cn(
                      "relative overflow-hidden rounded-3xl border p-4 pl-5 transition-all duration-200",
                      theme.ruleItem
                    )}
                  >
                    <div
                      aria-hidden
                      className="absolute left-0 top-0 h-full w-1.5"
                      style={{ backgroundColor: rule?.color || "#f97316" }}
                    />

                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-bold",
                          theme.badge
                        )}
                      >
                        #{index + 1}
                      </span>

                      <span
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-semibold",
                          theme.badge
                        )}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-white/30"
                          style={{ backgroundColor: rule?.color || "#f97316" }}
                        />
                        {rule?.color || "#f97316"}
                      </span>
                    </div>

                    <p className={cn("text-sm leading-6", theme.softText)}>
                      {formatTextWithLinks(rule?.text)}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div
                className={cn(
                  "flex min-h-[340px] items-center justify-center rounded-3xl border p-8 text-center",
                  theme.cardSoft
                )}
              >
                <div>
                  <div
                    className={cn(
                      "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border",
                      theme.iconBox
                    )}
                  >
                    <AlertCircle className="h-7 w-7" />
                  </div>

                  <h3 className={cn("mt-4 text-lg font-semibold", theme.text)}>
                    No rules found
                  </h3>
                  <p className={cn("mt-2 max-w-sm text-sm", theme.mutedText)}>
                    There are no active platform rules available right now.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Definitions Section */}
        <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.16 }}
          className="xl:col-span-7"
        >
          <Card theme={theme}>
            <SectionHeader
              theme={theme}
              icon={<BookOpenIcon className="h-5 w-5" />}
              title="Forex Definitions"
              subtitle="Quick explanations of common trading terms."
            />

            <div className="space-y-3">
              {definitions.map((definition) => (
                <DefinitionAccordion
                  key={definition.title}
                  title={definition.title}
                  content={definition.content}
                  isOpen={expandedDefinition === definition.title}
                  toggle={() => toggleDefinition(definition.title)}
                  isDark={isDark}
                  theme={theme}
                />
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default UserRules;