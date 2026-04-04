import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  Settings2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Switch } from "@/Components/ui/switch";
import { superAdminApi } from "@/utils/apiClients";

const emptyLotRule = () => ({
  fromLot: 0,
  toLot: 0,
  releasePercent: 0,
});

const emptySlab = () => ({
  depositAmount: 0,
  bonusPercent: 0,
  isActive: true,
  lotReleaseRules: [emptyLotRule()],
});

const emptyForm = () => ({
  title: "",
  isActive: true,
  slabs: [emptySlab()],
});

const SadminBonusConfig = () => {
  const mode = useSelector((store) => store.superadminTheme?.mode || "dark");
  const isDark = mode === "dark";

  const inputClass = [
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-300",
    isDark
      ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-blue-400/30 focus:ring-2 focus:ring-blue-500/20"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200",
    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
  ].join(" ");

  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [togglingId, setTogglingId] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});

  const visibleConfigs = useMemo(() => configs, [configs]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId("");
    setErrors({});
    setShowModal(false);
  };

  const fetchConfigs = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams();
      if (search.trim()) query.append("search", search.trim());
      if (statusFilter !== "all") {
        query.append("isActive", String(statusFilter === "active"));
      }

      const url = `/deposit-bonus-config/all${
        query.toString() ? `?${query.toString()}` : ""
      }`;

      const res = await superAdminApi.get(url);
      setConfigs(res?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch bonus configs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  useEffect(() => {
    if (!showModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEsc = (e) => {
      if (e.key === "Escape" && !saving) {
        resetForm();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEsc);
    };
  }, [showModal, saving]);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setSlabField = (slabIndex, field, value) => {
    setForm((prev) => {
      const slabs = [...prev.slabs];
      slabs[slabIndex] = {
        ...slabs[slabIndex],
        [field]: field === "isActive" ? value : Number(value),
      };
      return { ...prev, slabs };
    });
  };

  const setLotRuleField = (slabIndex, ruleIndex, field, value) => {
    setForm((prev) => {
      const slabs = [...prev.slabs];
      const rules = [...slabs[slabIndex].lotReleaseRules];
      rules[ruleIndex] = {
        ...rules[ruleIndex],
        [field]: Number(value),
      };
      slabs[slabIndex] = {
        ...slabs[slabIndex],
        lotReleaseRules: rules,
      };
      return { ...prev, slabs };
    });
  };

  const addSlab = () => {
    setForm((prev) => ({
      ...prev,
      slabs: [...prev.slabs, emptySlab()],
    }));
  };

  const removeSlab = (slabIndex) => {
    setForm((prev) => ({
      ...prev,
      slabs: prev.slabs.filter((_, index) => index !== slabIndex),
    }));
  };

  const addLotRule = (slabIndex) => {
    setForm((prev) => {
      const slabs = [...prev.slabs];
      slabs[slabIndex] = {
        ...slabs[slabIndex],
        lotReleaseRules: [...slabs[slabIndex].lotReleaseRules, emptyLotRule()],
      };
      return { ...prev, slabs };
    });
  };

  const removeLotRule = (slabIndex, ruleIndex) => {
    setForm((prev) => {
      const slabs = [...prev.slabs];
      slabs[slabIndex] = {
        ...slabs[slabIndex],
        lotReleaseRules: slabs[slabIndex].lotReleaseRules.filter(
          (_, index) => index !== ruleIndex
        ),
      };
      return { ...prev, slabs };
    });
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required";
    }

    if (!Array.isArray(form.slabs) || form.slabs.length === 0) {
      nextErrors.slabs = "At least one slab is required";
    }

    const depositAmounts = new Set();

    form.slabs.forEach((slab, slabIndex) => {
      if (!slab.depositAmount || slab.depositAmount <= 0) {
        nextErrors[`slab_${slabIndex}_depositAmount`] =
          "Deposit amount must be greater than 0";
      }

      if (
        !Number.isFinite(Number(slab.bonusPercent)) ||
        Number(slab.bonusPercent) <= 0 ||
        Number(slab.bonusPercent) > 100
      ) {
        nextErrors[`slab_${slabIndex}_bonusPercent`] =
          "Bonus percent must be between 1 and 100";
      }

      if (depositAmounts.has(Number(slab.depositAmount))) {
        nextErrors[`slab_${slabIndex}_depositAmount`] =
          "Duplicate deposit amount not allowed";
      }
      depositAmounts.add(Number(slab.depositAmount));

      if (
        !Array.isArray(slab.lotReleaseRules) ||
        slab.lotReleaseRules.length === 0
      ) {
        nextErrors[`slab_${slabIndex}_lotReleaseRules`] =
          "At least one lot release rule is required";
      }

      const sortedRules = [...(slab.lotReleaseRules || [])].sort(
        (a, b) => Number(a.fromLot) - Number(b.fromLot)
      );

      let totalRelease = 0;

      sortedRules.forEach((rule, ruleIndex) => {
        const ruleKey = `slab_${slabIndex}_rule_${ruleIndex}`;

        if (Number(rule.fromLot) < 0 || Number(rule.toLot) < 0) {
          nextErrors[ruleKey] = "Lot values cannot be negative";
        }

        if (Number(rule.fromLot) > Number(rule.toLot)) {
          nextErrors[ruleKey] = "From lot cannot be greater than To lot";
        }

        if (
          !Number.isFinite(Number(rule.releasePercent)) ||
          Number(rule.releasePercent) <= 0 ||
          Number(rule.releasePercent) > 100
        ) {
          nextErrors[ruleKey] = "Release percent must be between 1 and 100";
        }

        totalRelease += Number(rule.releasePercent);

        if (ruleIndex > 0) {
          const prev = sortedRules[ruleIndex - 1];
          if (Number(rule.fromLot) <= Number(prev.toLot)) {
            nextErrors[ruleKey] = "Lot ranges cannot overlap";
          }
        }
      });

      if (totalRelease > 100) {
        nextErrors[`slab_${slabIndex}_lotReleaseTotal`] =
          "Total release percent cannot exceed 100";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const normalizePayload = () => ({
    title: form.title.trim(),
    isActive: !!form.isActive,
    slabs: form.slabs.map((slab) => ({
      depositAmount: Number(slab.depositAmount),
      bonusPercent: Number(slab.bonusPercent),
      isActive: !!slab.isActive,
      lotReleaseRules: slab.lotReleaseRules
        .map((rule) => ({
          fromLot: Number(rule.fromLot),
          toLot: Number(rule.toLot),
          releasePercent: Number(rule.releasePercent),
        }))
        .sort((a, b) => a.fromLot - b.fromLot),
    })),
  });

  const handleCreate = () => {
    setEditingId("");
    setForm(emptyForm());
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (config) => {
    setEditingId(config._id);
    setForm({
      title: config.title || "",
      isActive: !!config.isActive,
      slabs:
        config.slabs?.length > 0
          ? config.slabs.map((slab) => ({
              depositAmount: slab.depositAmount ?? 0,
              bonusPercent: slab.bonusPercent ?? 0,
              isActive: slab.isActive ?? true,
              lotReleaseRules:
                slab.lotReleaseRules?.length > 0
                  ? slab.lotReleaseRules.map((rule) => ({
                      fromLot: rule.fromLot ?? 0,
                      toLot: rule.toLot ?? 0,
                      releasePercent: rule.releasePercent ?? 0,
                    }))
                  : [emptyLotRule()],
            }))
          : [emptySlab()],
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const payload = normalizePayload();

      if (editingId) {
        await superAdminApi.put(
          `/deposit-bonus-config/update/${editingId}`,
          payload
        );
      } else {
        await superAdminApi.post(`/deposit-bonus-config/create`, payload);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);

      resetForm();
      fetchConfigs();
    } catch (error) {
      console.error("Save bonus config failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Are you sure you want to delete this bonus config?"
    );
    if (!ok) return;

    try {
      setDeletingId(id);
      await superAdminApi.delete(`/deposit-bonus-config/delete/${id}`);
      fetchConfigs();
    } catch (error) {
      console.error("Delete bonus config failed:", error);
    } finally {
      setDeletingId("");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setTogglingId(id);
      await superAdminApi.patch(`/deposit-bonus-config/toggle-status/${id}`);
      fetchConfigs();
    } catch (error) {
      console.error("Toggle bonus config failed:", error);
    } finally {
      setTogglingId("");
    }
  };

  const formatPercent = (value) => `${Number(value || 0)}%`;
  const formatCurrency = (value) => `$${Number(value || 0)}`;

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div
            className={[
              "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
              isDark
                ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                : "border-orange-200 bg-orange-50 text-orange-700",
            ].join(" ")}
          >
            <ShieldCheck size={14} />
            Bonus Configuration
          </div>

          <h2
            className={[
              "text-2xl sm:text-3xl font-bold tracking-tight",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            Deposit Bonus Config
          </h2>

          <p
            className={[
              "mt-1 text-sm",
              isDark ? "text-white/50" : "text-slate-600",
            ].join(" ")}
          >
            Manage deposit slabs, bonus percentages, and lot-based release rules.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className={[
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300",
            isDark
              ? "bg-blue-500/90 text-white hover:bg-blue-500 shadow-[0_10px_25px_rgba(59,130,246,0.25)]"
              : "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_10px_25px_rgba(249,115,22,0.22)]",
          ].join(" ")}
        >
          <Plus className="h-4 w-4" />
          Create Config
        </button>
      </div>

      {saveSuccess && (
        <div
          className={[
            "mb-6 flex items-center gap-2 rounded-[18px] border px-4 py-3 text-sm font-medium",
            isDark
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700",
          ].join(" ")}
        >
          <CheckCircle2 className="h-5 w-5" />
          Bonus config saved successfully!
        </div>
      )}

      <Section
        title="Filters"
        subtitle="Search and refine existing bonus configurations"
        isDark={isDark}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title"
            className={inputClass}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <button
            onClick={fetchConfigs}
            className={[
              "rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
              isDark
                ? "bg-white/[0.06] text-white border border-white/10 hover:bg-white/[0.09]"
                : "bg-slate-900 text-white hover:bg-slate-800",
            ].join(" ")}
          >
            Apply Filters
          </button>
        </div>
      </Section>

      <Section
        title={`All Configs (${visibleConfigs.length})`}
        subtitle="Create, edit, activate, deactivate, and inspect bonus slabs"
        isDark={isDark}
      >
        {loading ? (
          <div
            className={[
              "rounded-[20px] border p-6 flex items-center gap-3",
              isDark
                ? "border-white/10 bg-white/[0.03] text-white"
                : "border-slate-200 bg-white text-slate-700",
            ].join(" ")}
          >
            <Loader2
              className={[
                "h-5 w-5 animate-spin",
                isDark ? "text-blue-300" : "text-orange-500",
              ].join(" ")}
            />
            <p>Loading bonus configs...</p>
          </div>
        ) : visibleConfigs.length === 0 ? (
          <div
            className={[
              "rounded-[20px] border p-6 text-sm italic",
              isDark
                ? "border-white/10 bg-white/[0.03] text-white/50"
                : "border-slate-200 bg-white text-slate-500",
            ].join(" ")}
          >
            No bonus configuration found.
          </div>
        ) : (
          <div className="space-y-4">
            {visibleConfigs.map((config) => {
              const isExpanded = expandedId === config._id;

              return (
                <div
                  key={config._id}
                  className={[
                    "rounded-[20px] border p-4 sm:p-5 transition-all duration-300",
                    isDark
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-slate-200 bg-white/70",
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={[
                            "text-lg font-semibold",
                            isDark ? "text-white" : "text-slate-900",
                          ].join(" ")}
                        >
                          {config.title}
                        </h3>

                        <span
                          className={[
                            "px-3 py-1 rounded-full text-xs font-medium border",
                            config.isActive
                              ? isDark
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isDark
                              ? "bg-red-500/20 text-red-300 border-red-500/40"
                              : "bg-red-50 text-red-600 border-red-200",
                          ].join(" ")}
                        >
                          {config.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <p
                        className={[
                          "text-sm",
                          isDark ? "text-white/50" : "text-slate-500",
                        ].join(" ")}
                      >
                        Slabs: {config.slabs?.length || 0}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? "" : config._id)
                        }
                        className={[
                          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300",
                          isDark
                            ? "bg-white/[0.06] text-white border border-white/10 hover:bg-white/[0.09]"
                            : "bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200",
                        ].join(" ")}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        {isExpanded ? "Hide" : "View"}
                      </button>

                      <button
                        onClick={() => handleEdit(config)}
                        className={[
                          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300",
                          isDark
                            ? "bg-blue-500/90 text-white hover:bg-blue-500"
                            : "bg-orange-500 text-white hover:bg-orange-600",
                        ].join(" ")}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        onClick={() => handleToggleStatus(config._id)}
                        disabled={togglingId === config._id}
                        className={[
                          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 disabled:opacity-60",
                          isDark
                            ? "bg-emerald-500/90 text-white hover:bg-emerald-500"
                            : "bg-emerald-500 text-white hover:bg-emerald-600",
                        ].join(" ")}
                      >
                        {togglingId === config._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Settings2 className="h-4 w-4" />
                        )}
                        {config.isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => handleDelete(config._id)}
                        disabled={deletingId === config._id}
                        className={[
                          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 disabled:opacity-60",
                          isDark
                            ? "bg-red-500/90 text-white hover:bg-red-500"
                            : "bg-red-500 text-white hover:bg-red-600",
                        ].join(" ")}
                      >
                        {deletingId === config._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 space-y-4">
                      {(config.slabs || []).map((slab, slabIndex) => {
                        const totalRelease = (
                          slab.lotReleaseRules || []
                        ).reduce(
                          (sum, rule) =>
                            sum + Number(rule.releasePercent || 0),
                          0
                        );
                        const bonusValue =
                          (Number(slab.depositAmount || 0) *
                            Number(slab.bonusPercent || 0)) /
                          100;

                        return (
                          <div
                            key={slabIndex}
                            className={[
                              "rounded-[18px] border p-4",
                              isDark
                                ? "border-white/10 bg-white/[0.03]"
                                : "border-slate-200 bg-slate-50",
                            ].join(" ")}
                          >
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Badge
                                isDark={isDark}
                                label={`Deposit ${formatCurrency(
                                  slab.depositAmount
                                )}`}
                              />
                              <Badge
                                isDark={isDark}
                                label={`Bonus ${formatPercent(
                                  slab.bonusPercent
                                )}`}
                              />
                              <Badge
                                isDark={isDark}
                                label={`Bonus Amount ${formatCurrency(
                                  bonusValue
                                )}`}
                              />
                              <Badge
                                isDark={isDark}
                                label={`Release Total ${formatPercent(
                                  totalRelease
                                )}`}
                              />
                              <Badge
                                isDark={isDark}
                                label={
                                  slab.isActive
                                    ? "Slab Active"
                                    : "Slab Inactive"
                                }
                                active={!!slab.isActive}
                              />
                            </div>

                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr
                                    className={
                                      isDark
                                        ? "text-white/55"
                                        : "text-slate-500"
                                    }
                                  >
                                    <th className="text-left py-2 pr-4">
                                      From Lot
                                    </th>
                                    <th className="text-left py-2 pr-4">
                                      To Lot
                                    </th>
                                    <th className="text-left py-2 pr-4">
                                      Release %
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(slab.lotReleaseRules || []).map(
                                    (rule, ruleIndex) => (
                                      <tr
                                        key={ruleIndex}
                                        className={
                                          isDark
                                            ? "border-t border-white/10"
                                            : "border-t border-slate-200"
                                        }
                                      >
                                        <td className="py-2 pr-4">
                                          {rule.fromLot}
                                        </td>
                                        <td className="py-2 pr-4">
                                          {rule.toLot}
                                        </td>
                                        <td className="py-2 pr-4">
                                          {formatPercent(rule.releasePercent)}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <BonusConfigModal
        open={showModal}
        isDark={isDark}
        inputClass={inputClass}
        form={form}
        errors={errors}
        saving={saving}
        editingId={editingId}
        setField={setField}
        setSlabField={setSlabField}
        setLotRuleField={setLotRuleField}
        addSlab={addSlab}
        removeSlab={removeSlab}
        addLotRule={addLotRule}
        removeLotRule={removeLotRule}
        onClose={resetForm}
        onSave={handleSubmit}
      />
    </div>
  );
};

const BonusConfigModal = ({
  open,
  isDark,
  inputClass,
  form,
  errors,
  saving,
  editingId,
  setField,
  setSlabField,
  setLotRuleField,
  addSlab,
  removeSlab,
  addLotRule,
  removeLotRule,
  onClose,
  onSave,
}) => {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-6">
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className={[
            "w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-[28px] border p-4 sm:p-6",
            isDark
              ? "border-white/10 bg-[#0B1220] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
              : "border-orange-100 bg-white shadow-[0_20px_60px_rgba(251,146,60,0.16)]",
          ].join(" ")}
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3
                className={[
                  "text-xl sm:text-2xl font-bold",
                  isDark ? "text-white" : "text-slate-900",
                ].join(" ")}
              >
                {editingId ? "Edit Bonus Config" : "Create Bonus Config"}
              </h3>
              <p
                className={[
                  "mt-1 text-sm",
                  isDark ? "text-white/50" : "text-slate-500",
                ].join(" ")}
              >
                Configure deposit slabs and lot-based release rules.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onSave}
                disabled={saving}
                className={[
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50",
                  isDark
                    ? "bg-emerald-500/90 text-white hover:bg-emerald-500"
                    : "bg-emerald-500 text-white hover:bg-emerald-600",
                ].join(" ")}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                onClick={onClose}
                disabled={saving}
                className={[
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50",
                  isDark
                    ? "bg-red-500/90 text-white hover:bg-red-500"
                    : "bg-red-500 text-white hover:bg-red-600",
                ].join(" ")}
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>
          </div>

          <Section title="Configuration Details" isDark={isDark}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label isDark={isDark}>Title</Label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="Enter config title"
                  className={inputClass}
                />
                {errors.title ? <ErrorText message={errors.title} /> : null}
              </div>

              <div className="flex items-end">
                <div
                  className={[
                    "w-full rounded-[18px] border p-4 flex items-center justify-between",
                    isDark
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-slate-200 bg-white/70",
                  ].join(" ")}
                >
                  <div>
                    <p
                      className={[
                        "text-sm font-semibold",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      Config Active
                    </p>
                    <p
                      className={[
                        "mt-1 text-xs",
                        isDark ? "text-white/45" : "text-slate-500",
                      ].join(" ")}
                    >
                      Enable or disable this bonus config
                    </p>
                  </div>
                  <Switch
                    checked={!!form.isActive}
                    onCheckedChange={(value) => setField("isActive", value)}
                  />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Deposit Slabs" isDark={isDark}>
            <div className="space-y-5">
              {form.slabs.map((slab, slabIndex) => {
                const totalRelease = (slab.lotReleaseRules || []).reduce(
                  (sum, rule) => sum + Number(rule.releasePercent || 0),
                  0
                );

                const bonusAmount =
                  (Number(slab.depositAmount || 0) *
                    Number(slab.bonusPercent || 0)) /
                  100;

                return (
                  <div
                    key={slabIndex}
                    className={[
                      "rounded-[20px] border p-4 sm:p-5",
                      isDark
                        ? "border-white/10 bg-white/[0.03]"
                        : "border-slate-200 bg-white/70",
                    ].join(" ")}
                  >
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4
                          className={[
                            "text-base font-semibold",
                            isDark ? "text-white" : "text-slate-900",
                          ].join(" ")}
                        >
                          Slab #{slabIndex + 1}
                        </h4>
                        <p
                          className={[
                            "text-sm mt-1",
                            isDark ? "text-white/45" : "text-slate-500",
                          ].join(" ")}
                        >
                          Define deposit amount, bonus percentage, and release
                          rules.
                        </p>
                      </div>

                      <button
                        onClick={() => removeSlab(slabIndex)}
                        disabled={form.slabs.length === 1}
                        className={[
                          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 disabled:opacity-40",
                          isDark
                            ? "bg-red-500/90 text-white hover:bg-red-500"
                            : "bg-red-500 text-white hover:bg-red-600",
                        ].join(" ")}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Slab
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                      <div>
                        <Label isDark={isDark}>Deposit Amount</Label>
                        <input
                          type="number"
                          value={slab.depositAmount}
                          onChange={(e) =>
                            setSlabField(
                              slabIndex,
                              "depositAmount",
                              e.target.value
                            )
                          }
                          placeholder="100"
                          className={inputClass}
                        />
                        {errors[`slab_${slabIndex}_depositAmount`] ? (
                          <ErrorText
                            message={errors[`slab_${slabIndex}_depositAmount`]}
                          />
                        ) : null}
                      </div>

                      <div>
                        <Label isDark={isDark}>Bonus Percent</Label>
                        <input
                          type="number"
                          value={slab.bonusPercent}
                          onChange={(e) =>
                            setSlabField(
                              slabIndex,
                              "bonusPercent",
                              e.target.value
                            )
                          }
                          placeholder="30"
                          className={inputClass}
                        />
                        {errors[`slab_${slabIndex}_bonusPercent`] ? (
                          <ErrorText
                            message={errors[`slab_${slabIndex}_bonusPercent`]}
                          />
                        ) : null}
                      </div>

                      <ReadOnlyStat
                        isDark={isDark}
                        label="Bonus Amount"
                        value={`$${Number(bonusAmount || 0)}`}
                      />

                      <div
                        className={[
                          "rounded-[18px] border p-4 flex items-center justify-between",
                          isDark
                            ? "border-white/10 bg-white/[0.03]"
                            : "border-slate-200 bg-white/70",
                        ].join(" ")}
                      >
                        <div>
                          <p
                            className={[
                              "text-sm font-semibold",
                              isDark ? "text-white" : "text-slate-900",
                            ].join(" ")}
                          >
                            Slab Active
                          </p>
                          <p
                            className={[
                              "mt-1 text-xs",
                              isDark ? "text-white/45" : "text-slate-500",
                            ].join(" ")}
                          >
                            Use this slab in live matching
                          </p>
                        </div>
                        <Switch
                          checked={!!slab.isActive}
                          onCheckedChange={(value) =>
                            setSlabField(slabIndex, "isActive", value)
                          }
                        />
                      </div>
                    </div>

                    <div
                      className={[
                        "rounded-[18px] border p-4",
                        isDark
                          ? "border-white/10 bg-white/[0.03]"
                          : "border-slate-200 bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h5
                            className={[
                              "text-sm font-semibold",
                              isDark ? "text-white" : "text-slate-900",
                            ].join(" ")}
                          >
                            Lot Release Rules
                          </h5>
                          <p
                            className={[
                              "mt-1 text-xs",
                              isDark ? "text-white/45" : "text-slate-500",
                            ].join(" ")}
                          >
                            Example: 0-2 lot = 10% release from bonus amount
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            isDark={isDark}
                            label={`Total Release ${totalRelease}%`}
                          />
                          <button
                            onClick={() => addLotRule(slabIndex)}
                            className={[
                              "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300",
                              isDark
                                ? "bg-blue-500/90 text-white hover:bg-blue-500"
                                : "bg-orange-500 text-white hover:bg-orange-600",
                            ].join(" ")}
                          >
                            <Plus className="h-4 w-4" />
                            Add Rule
                          </button>
                        </div>
                      </div>

                      {errors[`slab_${slabIndex}_lotReleaseRules`] ? (
                        <ErrorText
                          message={errors[`slab_${slabIndex}_lotReleaseRules`]}
                        />
                      ) : null}

                      {errors[`slab_${slabIndex}_lotReleaseTotal`] ? (
                        <ErrorText
                          message={errors[`slab_${slabIndex}_lotReleaseTotal`]}
                        />
                      ) : null}

                      <div className="space-y-3">
                        {slab.lotReleaseRules.map((rule, ruleIndex) => (
                          <div
                            key={ruleIndex}
                            className="grid grid-cols-1 md:grid-cols-4 gap-3"
                          >
                            <div>
                              <Label isDark={isDark}>From Lot</Label>
                              <input
                                type="number"
                                value={rule.fromLot}
                                onChange={(e) =>
                                  setLotRuleField(
                                    slabIndex,
                                    ruleIndex,
                                    "fromLot",
                                    e.target.value
                                  )
                                }
                                className={inputClass}
                              />
                            </div>

                            <div>
                              <Label isDark={isDark}>To Lot</Label>
                              <input
                                type="number"
                                value={rule.toLot}
                                onChange={(e) =>
                                  setLotRuleField(
                                    slabIndex,
                                    ruleIndex,
                                    "toLot",
                                    e.target.value
                                  )
                                }
                                className={inputClass}
                              />
                            </div>

                            <div>
                              <Label isDark={isDark}>Release Percent</Label>
                              <input
                                type="number"
                                value={rule.releasePercent}
                                onChange={(e) =>
                                  setLotRuleField(
                                    slabIndex,
                                    ruleIndex,
                                    "releasePercent",
                                    e.target.value
                                  )
                                }
                                className={inputClass}
                              />
                            </div>

                            <div className="flex items-end">
                              <button
                                onClick={() =>
                                  removeLotRule(slabIndex, ruleIndex)
                                }
                                disabled={slab.lotReleaseRules.length === 1}
                                className={[
                                  "w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-300 disabled:opacity-40",
                                  isDark
                                    ? "bg-red-500/90 text-white hover:bg-red-500"
                                    : "bg-red-500 text-white hover:bg-red-600",
                                ].join(" ")}
                              >
                                <Trash2 className="h-4 w-4" />
                                Remove Rule
                              </button>
                            </div>

                            {errors[`slab_${slabIndex}_rule_${ruleIndex}`] ? (
                              <div className="md:col-span-4">
                                <ErrorText
                                  message={
                                    errors[`slab_${slabIndex}_rule_${ruleIndex}`]
                                  }
                                />
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {errors.slabs ? <ErrorText message={errors.slabs} /> : null}

              <button
                onClick={addSlab}
                className={[
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300",
                  isDark
                    ? "bg-blue-500/90 text-white hover:bg-blue-500"
                    : "bg-orange-500 text-white hover:bg-orange-600",
                ].join(" ")}
              >
                <Plus className="h-4 w-4" />
                Add New Slab
              </button>
            </div>
          </Section>
        </div>
      </div>
    </div>,
    document.body
  );
};

const Section = ({ title, subtitle, children, isDark }) => (
  <div
    className={[
      "mt-6 rounded-[24px] border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300",
      isDark
        ? "border-white/10 bg-white/[0.04] shadow-[0_12px_35px_rgba(0,0,0,0.28)]"
        : "border-orange-100 bg-white/70 shadow-[0_12px_35px_rgba(251,146,60,0.10)]",
    ].join(" ")}
  >
    <div className="mb-4">
      <h3
        className={[
          "text-lg font-semibold",
          isDark ? "text-white" : "text-slate-900",
        ].join(" ")}
      >
        {title}
      </h3>
      {subtitle ? (
        <p
          className={[
            "mt-1 text-sm",
            isDark ? "text-white/45" : "text-slate-500",
          ].join(" ")}
        >
          {subtitle}
        </p>
      ) : null}
    </div>

    <div
      className={[
        "rounded-[20px] border p-4",
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-slate-200 bg-white/50",
      ].join(" ")}
    >
      {children}
    </div>
  </div>
);

const Label = ({ children, isDark }) => (
  <p
    className={[
      "mb-2 text-xs font-medium uppercase tracking-[0.12em]",
      isDark ? "text-white/45" : "text-slate-500",
    ].join(" ")}
  >
    {children}
  </p>
);

const ErrorText = ({ message }) => (
  <p className="mt-2 text-xs text-red-500">{message}</p>
);

const ReadOnlyStat = ({ label, value, isDark }) => (
  <div
    className={[
      "rounded-[18px] border p-4",
      isDark
        ? "border-white/10 bg-white/[0.03]"
        : "border-slate-200 bg-white/70",
    ].join(" ")}
  >
    <p
      className={[
        "mb-2 text-xs font-medium uppercase tracking-[0.12em]",
        isDark ? "text-white/45" : "text-slate-500",
      ].join(" ")}
    >
      {label}
    </p>
    <p
      className={[
        "text-sm font-semibold",
        isDark ? "text-white" : "text-slate-900",
      ].join(" ")}
    >
      {value}
    </p>
  </div>
);

const Badge = ({ label, isDark, active }) => (
  <span
    className={[
      "px-3 py-1 rounded-full text-xs font-medium border",
      typeof active === "boolean"
        ? active
          ? isDark
            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
            : "bg-emerald-50 text-emerald-700 border-emerald-200"
          : isDark
          ? "bg-red-500/20 text-red-300 border-red-500/40"
          : "bg-red-50 text-red-600 border-red-200"
        : isDark
        ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
        : "border-orange-200 bg-orange-50 text-orange-700",
    ].join(" ")}
  >
    {label}
  </span>
);

export default SadminBonusConfig;