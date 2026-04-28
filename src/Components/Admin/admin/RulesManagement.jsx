import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  Check,
  Edit2,
  FileText,
  Loader2,
  Palette,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../../utils/apiClients";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const RulesManagement = () => {
  const mode = useSelector((store) => store.adminTheme?.mode || "light");
  const isDark = mode === "dark";

  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({
    text: "",
    color: "#f97316",
    status: true,
  });
  const [editingRule, setEditingRule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const theme = useMemo(
    () => ({
      pageText: isDark ? "text-white" : "text-slate-900",
      mutedText: isDark ? "text-white/50" : "text-slate-500",
      softText: isDark ? "text-white/70" : "text-slate-600",

      card: isDark
        ? "border-white/10 bg-white/[0.045] shadow-[0_18px_55px_rgba(0,0,0,0.38)]"
        : "border-orange-100/90 bg-white/80 shadow-[0_18px_45px_rgba(251,146,60,0.12)]",

      cardSoft: isDark
        ? "border-white/10 bg-white/[0.035]"
        : "border-orange-100/80 bg-white/70",

      input: isDark
        ? "border-white/10 bg-white/[0.055] text-white placeholder:text-white/35 focus:border-blue-400/50 focus:ring-blue-400/20"
        : "border-orange-300 bg-orange-50/80 text-slate-900 placeholder:text-orange-400 shadow-[0_0_0_3px_rgba(251,146,60,0.08)] focus:border-orange-500 focus:bg-white focus:ring-orange-300/70",

      inputWrap: isDark
        ? "border-white/10 bg-white/[0.035]"
        : "border-orange-300 bg-orange-50/75 shadow-[0_0_0_3px_rgba(251,146,60,0.08)]",

      colorInput: isDark
        ? "border-white/10 bg-white/[0.04]"
        : "border-orange-300 bg-white shadow-[0_0_0_3px_rgba(251,146,60,0.10)]",

      iconBox: isDark
        ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
        : "border-orange-200 bg-orange-50 text-orange-600",

      primaryButton: isDark
        ? "bg-blue-500 text-white hover:bg-blue-400 focus:ring-blue-400/30"
        : "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-300",

      ghostButton: isDark
        ? "border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.08]"
        : "border-orange-100 bg-white/75 text-slate-600 hover:bg-orange-50",

      dangerButton: isDark
        ? "text-red-300 hover:bg-red-500/10"
        : "text-red-600 hover:bg-red-50",

      successBadge: isDark
        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
        : "border-emerald-200 bg-emerald-50 text-emerald-700",

      dangerBadge: isDark
        ? "border-red-400/20 bg-red-500/10 text-red-300"
        : "border-red-200 bg-red-50 text-red-700",
    }),
    [isDark]
  );

  const stats = useMemo(() => {
    const active = rules?.filter((rule) => Boolean(rule?.status))?.length || 0;
    const total = rules?.length || 0;

    return {
      total,
      active,
      inactive: total - active,
    };
  }, [rules]);

  const fetchRules = async () => {
    try {
      setLoading(true);

      const response = await adminApi.get("/get-rules");
      const data = response?.data?.data;

      setRules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch rules");
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async () => {
    const text = newRule.text.trim();

    if (!text) {
      setFormErrors({ text: "Rule text is required" });
      toast("Text can't be empty", { icon: "⚠️" });
      return;
    }

    try {
      setLoading(true);

      await adminApi.post("/add-rule", {
        text,
        color: newRule.color,
        status: newRule.status,
      });

      setNewRule({
        text: "",
        color: "#f97316",
        status: true,
      });
      setFormErrors({});

      toast.success("New rule added");
      await fetchRules();
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRule = async (id) => {
    const text = editingRule?.text?.trim();

    if (!text) {
      toast("Rule text can't be empty", { icon: "⚠️" });
      return;
    }

    try {
      setLoading(true);

      await adminApi.put("/update-rule", {
        id,
        text,
        color: editingRule.color,
        status: editingRule.status,
      });

      setEditingRule(null);
      toast.success("Rule updated");
      await fetchRules();
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this rule?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await adminApi.delete(`/delete-rule?id=${id}`);

      toast.success("Rule deleted");
      await fetchRules();
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <div className={cn("w-full space-y-5", theme.pageText)}>
      {/* Header */}
      <div
        className={cn(
          "relative overflow-hidden rounded-[28px] border p-5 transition-all duration-300 sm:p-6",
          theme.card
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(34,211,238,0.09), transparent 30%)"
              : "radial-gradient(circle at top left, rgba(251,146,60,0.20), transparent 34%), radial-gradient(circle at bottom right, rgba(255,237,213,0.90), transparent 32%)",
          }}
        />

        <div className="relative z-[1] flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                theme.iconBox
              )}
            >
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <div
                className={cn(
                  "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                  isDark
                    ? "border-white/10 bg-white/[0.05] text-white/55"
                    : "border-orange-100 bg-white/80 text-orange-600"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Rules Control Center
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Rules Management
              </h1>

              <p
                className={cn(
                  "mt-2 max-w-2xl text-sm leading-6",
                  theme.mutedText
                )}
              >
                Create, color-code, activate, deactivate, and manage platform
                rules from one clean admin workspace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:min-w-[390px]">
            {[
              { label: "Total", value: stats.total },
              { label: "Active", value: stats.active },
              { label: "Inactive", value: stats.inactive },
            ].map((item) => (
              <div
                key={item.label}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-center backdrop-blur-xl",
                  theme.cardSoft
                )}
              >
                <p
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.14em]",
                    theme.mutedText
                  )}
                >
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Add Rule */}
        <div
          className={cn(
            "rounded-[26px] border p-4 transition-all duration-300 sm:p-5 xl:col-span-4",
            theme.card
          )}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <PlusCircle className="h-5 w-5" />
                Add New Rule
              </h2>
              <p className={cn("mt-1 text-xs", theme.mutedText)}>
                Add a new platform rule with status and highlight color.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className={cn(
                  "mb-2 block text-xs font-semibold uppercase tracking-[0.14em]",
                  theme.mutedText
                )}
              >
                Rule Text
              </label>

              <textarea
                rows="7"
                placeholder="Enter rule text..."
                value={newRule.text}
                onChange={(e) => {
                  setNewRule((prev) => ({ ...prev, text: e.target.value }));
                  setFormErrors((prev) => ({ ...prev, text: "" }));
                }}
                className={cn(
                  "w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-4",
                  theme.input,
                  formErrors.text &&
                    "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                )}
              />

              {formErrors.text && (
                <p className="mt-2 text-xs font-medium text-red-500">
                  {formErrors.text}
                </p>
              )}
            </div>

            <div className={cn("rounded-2xl border p-4", theme.inputWrap)}>
              <label
                className={cn(
                  "mb-3 block text-xs font-semibold uppercase tracking-[0.14em]",
                  theme.mutedText
                )}
              >
                Rule Color
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={newRule.color}
                  onChange={(e) =>
                    setNewRule((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className={cn(
                    "h-11 w-16 cursor-pointer rounded-xl border p-1",
                    theme.colorInput
                  )}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Palette className={cn("h-4 w-4", theme.mutedText)} />
                    <span className="font-mono text-sm font-semibold">
                      {newRule.color}
                    </span>
                  </div>
                  <p className={cn("mt-1 text-xs", theme.mutedText)}>
                    This color will be shown on the rule card.
                  </p>
                </div>

                <div
                  className="h-11 w-11 rounded-2xl border border-white/20 shadow-inner"
                  style={{ backgroundColor: newRule.color }}
                />
              </div>
            </div>

            <div>
              <label
                className={cn(
                  "mb-2 block text-xs font-semibold uppercase tracking-[0.14em]",
                  theme.mutedText
                )}
              >
                Status
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setNewRule((prev) => ({ ...prev, status: true }))
                  }
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200",
                    newRule.status ? theme.successBadge : theme.ghostButton
                  )}
                >
                  <ToggleRight className="h-5 w-5" />
                  Active
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setNewRule((prev) => ({ ...prev, status: false }))
                  }
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200",
                    !newRule.status ? theme.dangerBadge : theme.ghostButton
                  )}
                >
                  <ToggleLeft className="h-5 w-5" />
                  Inactive
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddRule}
              disabled={loading}
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg outline-none transition-all duration-200 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70",
                theme.primaryButton
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              Add Rule
            </button>
          </div>
        </div>

        {/* Rules List */}
        <div
          className={cn(
            "rounded-[26px] border p-4 transition-all duration-300 sm:p-5 xl:col-span-8",
            theme.card
          )}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-5 w-5" />
                Existing Rules
              </h2>
              <p className={cn("mt-1 text-xs", theme.mutedText)}>
                Review, edit, and remove rules already configured.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchRules}
              disabled={loading}
              className={cn(
                "inline-flex w-fit items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70",
                theme.ghostButton
              )}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </button>
          </div>

          {loading && !rules?.length ? (
            <div
              className={cn(
                "flex min-h-[340px] items-center justify-center rounded-3xl border",
                theme.cardSoft
              )}
            >
              <div className="text-center">
                <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-500" />
                <p className={cn("mt-3 text-sm", theme.mutedText)}>
                  Loading rules...
                </p>
              </div>
            </div>
          ) : rules?.length ? (
            <div className="space-y-3">
              {rules.map((rule, index) => {
                const isEditing = editingRule?.id === rule._id;

                return (
                  <div
                    key={rule._id}
                    className={cn(
                      "group relative overflow-hidden rounded-3xl border p-4 transition-all duration-200",
                      isDark
                        ? "border-white/10 bg-white/[0.035] hover:bg-white/[0.055]"
                        : "border-orange-100 bg-white/75 hover:bg-white"
                    )}
                  >
                    <div
                      aria-hidden
                      className="absolute left-0 top-0 h-full w-1.5"
                      style={{ backgroundColor: rule?.color || "#f97316" }}
                    />

                    {isEditing ? (
                      <div className="space-y-4 pl-2">
                        <div>
                          <label
                            className={cn(
                              "mb-2 block text-xs font-semibold uppercase tracking-[0.14em]",
                              theme.mutedText
                            )}
                          >
                            Edit Rule Text
                          </label>

                          <textarea
                            rows="4"
                            value={editingRule?.text || ""}
                            onChange={(e) =>
                              setEditingRule((prev) => ({
                                ...prev,
                                text: e.target.value,
                              }))
                            }
                            className={cn(
                              "w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-4",
                              theme.input
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                          <div
                            className={cn(
                              "rounded-2xl border p-3",
                              theme.inputWrap
                            )}
                          >
                            <label
                              className={cn(
                                "mb-2 block text-xs font-semibold uppercase tracking-[0.14em]",
                                theme.mutedText
                              )}
                            >
                              Color
                            </label>

                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={editingRule?.color || "#f97316"}
                                onChange={(e) =>
                                  setEditingRule((prev) => ({
                                    ...prev,
                                    color: e.target.value,
                                  }))
                                }
                                className={cn(
                                  "h-10 w-14 cursor-pointer rounded-xl border p-1",
                                  theme.colorInput
                                )}
                              />

                              <span className="font-mono text-sm font-semibold">
                                {editingRule?.color}
                              </span>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "rounded-2xl border p-3 md:col-span-2",
                              theme.cardSoft
                            )}
                          >
                            <label
                              className={cn(
                                "mb-2 block text-xs font-semibold uppercase tracking-[0.14em]",
                                theme.mutedText
                              )}
                            >
                              Status
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingRule((prev) => ({
                                    ...prev,
                                    status: true,
                                  }))
                                }
                                className={cn(
                                  "flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all",
                                  editingRule.status
                                    ? theme.successBadge
                                    : theme.ghostButton
                                )}
                              >
                                <ToggleRight className="h-4 w-4" />
                                Active
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setEditingRule((prev) => ({
                                    ...prev,
                                    status: false,
                                  }))
                                }
                                className={cn(
                                  "flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all",
                                  !editingRule.status
                                    ? theme.dangerBadge
                                    : theme.ghostButton
                                )}
                              >
                                <ToggleLeft className="h-4 w-4" />
                                Inactive
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingRule(null)}
                            className={cn(
                              "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition-all",
                              theme.ghostButton
                            )}
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateRule(rule._id)}
                            disabled={loading}
                            className={cn(
                              "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-70",
                              isDark
                                ? "bg-emerald-500 hover:bg-emerald-400"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            )}
                          >
                            {loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 pl-2 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div className="min-w-0">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "rounded-full border px-2.5 py-1 text-[11px] font-bold",
                                theme.ghostButton
                              )}
                            >
                              #{index + 1}
                            </span>

                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                                rule.status
                                  ? theme.successBadge
                                  : theme.dangerBadge
                              )}
                            >
                              {rule.status ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                              {rule.status ? "Active" : "Inactive"}
                            </span>

                            <span
                              className={cn(
                                "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-semibold",
                                theme.ghostButton
                              )}
                            >
                              <span
                                className="h-3 w-3 rounded-full border border-white/30"
                                style={{ backgroundColor: rule?.color }}
                              />
                              {rule?.color || "No color"}
                            </span>
                          </div>

                          <p
                            className={cn(
                              "break-words text-sm leading-6",
                              theme.softText
                            )}
                          >
                            {rule.text}
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingRule({ ...rule, id: rule._id })
                            }
                            className={cn(
                              "inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition-all",
                              isDark
                                ? "border-blue-400/20 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                                : "border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100"
                            )}
                            title="Edit rule"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule._id)}
                            className={cn(
                              "inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition-all",
                              isDark
                                ? "border-red-400/20 bg-red-500/10"
                                : "border-red-100 bg-red-50",
                              theme.dangerButton
                            )}
                            title="Delete rule"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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

                <h3 className="mt-4 text-lg font-semibold">No rules found</h3>
                <p className={cn("mt-2 max-w-sm text-sm", theme.mutedText)}>
                  Start by adding your first rule from the form on the left.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RulesManagement;