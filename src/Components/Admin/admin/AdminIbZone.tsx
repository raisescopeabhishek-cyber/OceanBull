import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Edit2, Check, X, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../../utils/apiClients";

// ✨ ambient visuals (shared theme)
import { FloatingParticles } from "../../../utils/FloatingParticles";
import { AnimatedGrid } from "../../../utils/AnimatedGrid";

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

const EMPTY_LEVELS = Array.from({ length: 10 }, (_, i) => ({
  level: i + 1,
  id: "",
  levelBonus: "",
}));

const AdminIbZone = () => {
  // Theme from Redux
  const themeConfig = useSelector((state: any) => state.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const radius = theme?.radius || "14px";

  const [formData, setFormData] = useState(EMPTY_LEVELS);
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  const [accountsTypes, setAccountsTypes] = useState<any[]>([]);
  const [currentAccount, setCurrentAccount] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);

  // derived
  const configuredCount = useMemo(
    () => formData.filter((r) => r.levelBonus !== "" && Number(r.levelBonus) > 0).length,
    [formData]
  );

  const resetFormData = () => setFormData(EMPTY_LEVELS);

  const handleInputChange = (index: number, field: "levelBonus", value: string) => {
    const updated = [...formData];
    updated[index][field] = value === "" ? "" : value;
    setFormData(updated);
  };

  // --- API: account types
  const fetchAccountTypes = async () => {
    try {
      const res = await adminApi.get(`/get-custom-groups`);
      setAccountsTypes(res?.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load account types");
    }
  };

  // --- API: IB config for selected account
  const fetchIbs = async () => {
    if (!currentAccount?._id) return;

    setLoading(true);
    resetFormData();
    try {
      const res = await adminApi.get(`/admin-ibs`);
      const all = res?.data?.data || [];
      const filtered = all.filter((v: any) => v.accountTypeId === currentAccount._id);

      if (filtered.length) {
        const updated = Array.from({ length: 10 }, (_, idx) => {
          const level = idx + 1;
          const found = filtered.find(
            (ib: any) => ib.level === level && ib.accountTypeId === currentAccount._id
          );
          return {
            level,
            id: found ? found._id : "",
            levelBonus: found ? String(found.commission ?? "") : "",
          };
        });
        setFormData(updated);
      } else {
        resetFormData();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load IB config");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index: number) => setEditingIndex(index);

  const handleSave = async (index: number) => {
    const row = formData[index];
    if (!currentAccount?._id) {
      toast.error("Please select an account type first.");
      return;
    }

    const numeric = row.levelBonus === "" ? NaN : Number(row.levelBonus);
    if (!Number.isFinite(numeric) || numeric < 0) {
      toast.error("Enter a valid non-negative number for Level Bonus.");
      return;
    }

    const toastId = toast.loading("Saving…");
    setSavingIdx(index);

    try {
      if (!row.id) {
        await adminApi.post(`/add-admin-ib`, {
          accountType: currentAccount.customGroup,
          accountTypeId: currentAccount._id,
          level: row.level,
          commission: Number(numeric),
        });
      } else {
        await adminApi.put(`/update-admin-ib/${row.id}`, {
          commission: Number(numeric),
        });
      }

      toast.success("Saved successfully", { id: toastId });
      setEditingIndex(-1);
      await fetchIbs();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Save failed", { id: toastId });
    } finally {
      setSavingIdx(null);
    }
  };

  const handleCancel = () => setEditingIndex(-1);

  // init
  useEffect(() => {
    fetchAccountTypes();
  }, []);

  // set default account when list arrives
  useEffect(() => {
    if (accountsTypes?.length && !currentAccount) {
      setCurrentAccount(accountsTypes[0]);
    }
  }, [accountsTypes, currentAccount]);

  // fetch IBs whenever account changes
  useEffect(() => {
    fetchIbs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount?._id]);

  /* ------------------------------- styles -------------------------------- */
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

  const stickyHeaderStyle = {
    background: `linear-gradient(to bottom, ${rgba(theme?.bg || "0 0 0", 0.78)}, transparent)`,
    borderBottom: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
  } as React.CSSProperties;

  const cardStyle = {
    borderRadius: "24px",
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    background: `linear-gradient(135deg, ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.75)}, ${rgba(
      theme?.surface1 || theme?.bg || "0 0 0",
      0.88
    )})`,
    boxShadow: `0 18px 60px ${rgba(theme?.shadowColor || "0 0 0", 0.5)}`,
    overflow: "hidden",
  } as React.CSSProperties;

  const thStyle = {
    color: rgba(theme?.fg || "255 255 255", 0.82),
    borderBottom: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    background: rgba(theme?.headerRow || theme?.surface3 || "30 30 30", 0.55),
  } as React.CSSProperties;

  const inputStyle = {
    width: "10rem",
    padding: "0.5rem 0.75rem",
    borderRadius: radius,
    background: rgba(theme?.input || theme?.surface2 || "18 18 18", 0.35),
    border: `1px solid ${rgba(theme?.inputBorder || theme?.border || "255 255 255", 0.18)}`,
    color: rgb(theme?.fg || "255 255 255"),
    outline: "none",
  } as React.CSSProperties;

  const selectStyle = {
    appearance: "none",
    width: "16rem",
    padding: "0.65rem 1rem",
    borderRadius: "18px",
    background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.28),
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.18)}`,
    color: rgba(theme?.fg || "255 255 255", 0.92),
    backdropFilter: "blur(10px)",
    outline: "none",
  } as React.CSSProperties;

  const buttonBaseStyle = {
    borderRadius: "18px",
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.18)}`,
    color: rgba(theme?.fg || "255 255 255", 0.9),
    background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.22),
  } as React.CSSProperties;

  const gradientTitleStyle = {
    backgroundImage: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "59 130 246")}, ${rgb(
      theme?.gradientTo || "147 51 234"
    )})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  } as React.CSSProperties;

  return (
    <div className="relative" style={pageBgStyle}>
      {/* ambient theme */}
      <AnimatedGrid />
      <FloatingParticles />

      <div className="max-w-7xl mx-auto pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Sticky header */}
        <div
          className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-3 backdrop-blur-md"
          style={stickyHeaderStyle}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold drop-shadow" style={gradientTitleStyle}>
              IB Configuration
            </h1>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Account selector */}
              <div className="relative">
                <select
                  value={currentAccount?._id || ""}
                  onChange={(e) => {
                    const sel = accountsTypes.find((v) => v?._id === e.target.value) || null;
                    setCurrentAccount(sel);
                  }}
                  style={selectStyle}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLSelectElement).style.boxShadow = `0 0 0 3px ${rgba(
                      theme?.ring || theme?.accent || "59 130 246",
                      0.22
                    )}`;
                    (e.currentTarget as HTMLSelectElement).style.borderColor = rgba(
                      theme?.ring || theme?.accent || "59 130 246",
                      0.4
                    );
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLSelectElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLSelectElement).style.borderColor = rgba(
                      theme?.border || theme?.inputBorder || "255 255 255",
                      0.18
                    );
                  }}
                >
                  <option value="" disabled>
                    {accountsTypes.length ? "Select Account" : "Loading…"}
                  </option>
                  {accountsTypes.map((v) => (
                    <option key={v?._id} value={v?._id}>
                      {v?.customGroup}
                    </option>
                  ))}
                </select>
                <div
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.55) }}
                >
                  ▾
                </div>
              </div>

              <button
                onClick={fetchIbs}
                className="px-4 py-2.5 transition-all flex items-center gap-2"
                style={buttonBaseStyle}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 22px ${rgba(
                    theme?.glow || theme?.accent || "59 130 246",
                    0.22
                  )}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>

          {/* quick stats */}
          <div className="mt-3 text-xs sm:text-sm" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
            Selected: <span style={{ color: rgba(theme?.fg || "255 255 255", 0.88) }}>{currentAccount?.customGroup || "—"}</span>{" "}
            • Configured Levels:{" "}
            <span style={{ color: rgba(theme?.fg || "255 255 255", 0.88) }}>{configuredCount}/10</span>
          </div>
        </div>

        {/* Table Card */}
        <div className="mt-6" style={cardStyle}>
          <div className="overflow-x-auto relative">
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              <table className="w-full min-w-[760px] whitespace-nowrap">
                <thead className="sticky top-0 z-10">
                  <tr style={thStyle}>
                    <th className="py-3 px-4 text-left font-medium">Level</th>
                    <th className="py-3 px-4 text-left font-medium">Level Bonus / Lot</th>
                    <th className="py-3 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {formData.map((row, index) => {
                    const isEditing = editingIndex === index;
                    const isSaving = savingIdx === index;

                    return (
                      <tr
                        key={row.level}
                        className="border-b transition-colors"
                        style={{
                          borderBottomColor: rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12),
                          background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.16),
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background = rgba(
                            theme?.rowHover || theme?.surface3 || "30 30 30",
                            0.26
                          );
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background = rgba(
                            theme?.surface2 || theme?.card || "18 18 18",
                            0.16
                          );
                        }}
                      >
                        <td className="py-3 px-4">
                          <div className="inline-flex items-center gap-2">
                            <span
                              className="inline-flex w-8 h-8 items-center justify-center text-white text-sm font-semibold"
                              style={{
                                borderRadius: "14px",
                                background: `linear-gradient(90deg, ${rgba(
                                  theme?.gradientFrom || theme?.accent || "59 130 246",
                                  0.98
                                )}, ${rgba(theme?.gradientTo || "147 51 234", 0.98)})`,
                                boxShadow: `0 10px 26px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.18)}`,
                              }}
                            >
                              {row.level}
                            </span>
                            <span style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.75) }}>
                              Level {row.level}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {isEditing ? (
                            <input
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              min="0"
                              value={row.levelBonus}
                              onChange={(e) => handleInputChange(index, "levelBonus", e.target.value)}
                              style={inputStyle}
                              placeholder="e.g. 3.50"
                              onFocus={(e) => {
                                (e.currentTarget as HTMLInputElement).style.boxShadow = `0 0 0 3px ${rgba(
                                  theme?.ring || theme?.accent || "59 130 246",
                                  0.22
                                )}`;
                                (e.currentTarget as HTMLInputElement).style.borderColor = rgba(
                                  theme?.ring || theme?.accent || "59 130 246",
                                  0.4
                                );
                              }}
                              onBlur={(e) => {
                                (e.currentTarget as HTMLInputElement).style.boxShadow = "none";
                                (e.currentTarget as HTMLInputElement).style.borderColor = rgba(
                                  theme?.inputBorder || theme?.border || "255 255 255",
                                  0.18
                                );
                              }}
                            />
                          ) : (
                            <span style={{ color: rgba(theme?.fg || "255 255 255", 0.88) }}>
                              {row.levelBonus !== "" ? row.levelBonus : (
                                <span style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.55) }}>Not set</span>
                              )}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                disabled={isSaving}
                                onClick={() => handleSave(index)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 transition-all disabled:opacity-60"
                                style={{
                                  borderRadius: radius,
                                  border: `1px solid ${rgba(theme?.success || theme?.primary || "34 197 94", 0.3)}`,
                                  background: rgba(theme?.success || theme?.primary || "34 197 94", 0.18),
                                  color: rgba(theme?.success || theme?.primary || "34 197 94", 0.95),
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSaving)
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 22px ${rgba(
                                      theme?.success || theme?.primary || "34 197 94",
                                      0.18
                                    )}`;
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                                }}
                              >
                                <Check className="w-4 h-4" /> Save
                              </button>

                              <button
                                disabled={isSaving}
                                onClick={handleCancel}
                                className="inline-flex items-center gap-2 px-3 py-1.5 transition-all disabled:opacity-60"
                                style={{
                                  borderRadius: radius,
                                  border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.18)}`,
                                  background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.18),
                                  color: rgba(theme?.fg || "255 255 255", 0.85),
                                }}
                              >
                                <X className="w-4 h-4" /> Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEdit(index)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 transition-all"
                              style={{
                                borderRadius: radius,
                                border: `1px solid ${rgba(theme?.info || theme?.accent || "59 130 246", 0.3)}`,
                                background: rgba(theme?.info || theme?.accent || "59 130 246", 0.08),
                                color: rgba(theme?.info || theme?.accent || "59 130 246", 0.92),
                              }}
                            >
                              <Edit2 className="w-4 h-4" /> Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {loading && (
                <div className="py-10 text-center" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
                  Loading levels…
                </div>
              )}
            </div>
          </div>

          {/* footer hint */}
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-3 border-t"
            style={{
              borderTopColor: rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12),
              background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.22),
            }}
          >
            <div className="text-xs sm:text-sm" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
              Account: <span style={{ color: rgba(theme?.fg || "255 255 255", 0.88) }}>{currentAccount?.customGroup || "—"}</span>
            </div>
            <div className="text-xs sm:text-sm" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
              Configured: <span style={{ color: rgba(theme?.fg || "255 255 255", 0.88) }}>{configuredCount}</span>/10
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminIbZone;
