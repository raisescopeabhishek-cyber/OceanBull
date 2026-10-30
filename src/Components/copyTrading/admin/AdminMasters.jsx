import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { copyTradingApi } from "../api/copyTradingApi";
import { cx } from "../utils/copyTradingHelpers";
import CopyTradingEmptyState from "../shared/CopyTradingEmptyState";
import {
  formatAgo,
  pickCreatedTime,
  pickLogin,
  safeArray,
  valueOf,
} from "./adminCopyTradingHelpers";

const PAGE_SIZE = 10;

const emptyForm = {
  login: "",
  name: "",
  commission: "",
  min_invest: "",
  description: "",
  chat_link: "",
};

const MasterModal = ({ isDark, open, mode, form, setForm, loading, onClose, onSubmit }) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className={cx(
          "w-full max-w-2xl rounded-card border p-5","border-line bg-surface text-text"
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-black">
            {mode === "edit" ? "Update Master" : "Add Master"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={cx(
              "rounded-card border p-2","border-line hover:bg-surface-2"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            ["login", "MT5 Login"],
            ["name", "Master Name"],
            ["commission", "Commission %"],
            ["min_invest", "Minimum Investment"],
            ["chat_link", "Chat Link"],
          ].map(([key, label]) => (
            <label key={key} className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-success">
                {label}
              </span>
              <input
                value={form[key]}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, [key]: event.target.value }))
                }
                className={cx(
                  "w-full rounded-card border px-4 py-3 text-sm font-semibold outline-none","border-line bg-surface text-text"
                )}
              />
            </label>
          ))}

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-success">
              Description
            </span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              className={cx(
                "min-h-[110px] w-full rounded-card border px-4 py-3 text-sm font-semibold outline-none","border-line bg-surface text-text"
              )}
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={cx(
              "rounded-card border px-5 py-3 text-sm font-bold","border-line hover:bg-surface-2"
            )}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="rounded-card bg-success px-5 py-3 text-sm font-bold text-text hover:bg-success disabled:opacity-60"
          >
            {loading ? "Saving..." : mode === "edit" ? "Update Master" : "Create Master"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const AdminMasters = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      setLoading(true);
      const res = await copyTradingApi.adminGetMasters();
      setMasters(safeArray(res));
      setPage(1);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to load masters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();

    const output = masters
      .filter((row) => {
        if (!q) return true;
        return JSON.stringify(row || {}).toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (sortBy === "oldest") return pickCreatedTime(a) - pickCreatedTime(b);
        if (sortBy === "commissionHigh") {
          return Number(valueOf(b, ["commission", "Commission"], 0)) - Number(valueOf(a, ["commission", "Commission"], 0));
        }
        if (sortBy === "commissionLow") {
          return Number(valueOf(a, ["commission", "Commission"], 0)) - Number(valueOf(b, ["commission", "Commission"], 0));
        }
        if (sortBy === "loginAsc") return Number(pickLogin(a) || 0) - Number(pickLogin(b) || 0);
        if (sortBy === "loginDesc") return Number(pickLogin(b) || 0) - Number(pickLogin(a) || 0);
        return pickCreatedTime(b) - pickCreatedTime(a);
      });

    return output;
  }, [masters, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openCreate = () => {
    setModalMode("create");
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setModalMode("edit");
    setForm({
      login: pickLogin(row),
      name: valueOf(row, ["name", "Name", "nickname"], ""),
      commission: valueOf(row, ["commission", "Commission"], ""),
      min_invest: valueOf(row, ["min_invest", "minInvest", "minimumInvestment"], ""),
      description: valueOf(row, ["description", "Description"], ""),
      chat_link: valueOf(row, ["chat_link", "chatLink"], ""),
    });
    setModalOpen(true);
  };

  const submitForm = async () => {
    if (!form.login) {
      toast.error("MT5 login is required.");
      return;
    }

    try {
      setActionLoading(true);

      if (modalMode === "edit") {
        await copyTradingApi.adminUpdateMaster({
          ...form,
          MT5Account: form.login,
          mt5Account: form.login,
        });
        toast.success("Master updated successfully");
      } else {
        await copyTradingApi.adminAddMaster({
          ...form,
          MT5Account: form.login,
          mt5Account: form.login,
        });
        toast.success("Master created successfully");
      }

      setModalOpen(false);
      load();
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteMaster = async (row) => {
    const login = pickLogin(row);

    if (!window.confirm(`Delete master #${login}?`)) return;

    try {
      setActionLoading(true);
      await copyTradingApi.adminDeleteMaster({
        login,
        MT5Account: login,
        mt5Account: login,
      });
      toast.success("Master deleted successfully");
      load();
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Delete failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <MasterModal
        isDark={isDark}
        open={modalOpen}
        mode={modalMode}
        form={form}
        setForm={setForm}
        loading={actionLoading}
        onClose={() => setModalOpen(false)}
        onSubmit={submitForm}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Masters CRUD</h1>
          <p className={cx("mt-1 text-sm","text-subtle")}>
            Manage copy-trading master accounts. Newest records show first.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-card bg-success px-5 py-3 text-sm font-black text-text hover:bg-success"
        >
          <Plus className="h-4 w-4" />
          Add Master
        </button>
      </div>

      <div
        className={cx(
          "grid grid-cols-1 gap-3 rounded-card border p-4 md:grid-cols-[1fr_220px_auto]","border-line bg-surface-2"
        )}
      >
        <div className="flex items-center gap-2 rounded-card border border-success bg-surface px-4 py-3 text-text">
          <Search className="h-4 w-4 text-success" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search masters..."
            className="w-full bg-transparent text-sm font-semibold outline-none"
          />
        </div>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className={cx(
            "rounded-card border px-4 py-3 text-sm font-bold outline-none","border-line bg-surface text-text"
          )}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="commissionHigh">Commission High</option>
          <option value="commissionLow">Commission Low</option>
          <option value="loginAsc">Login ↑</option>
          <option value="loginDesc">Login ↓</option>
        </select>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className={cx(
            "inline-flex items-center justify-center gap-2 rounded-card border px-4 py-3 text-sm font-bold","border-line bg-surface-2 text-text"
          )}
        >
          <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-5 text-sm">Loading masters...</div>
      ) : !rows.length ? (
        <CopyTradingEmptyState
          isDark={isDark}
          title="No masters found"
          subtitle="Try changing search filters."
        />
      ) : (
        <div
          className={cx(
            "overflow-hidden rounded-card border","border-line bg-surface-2"
          )}
        >
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm table-stack">
              <thead>
                <tr className={cx("border-b text-xs uppercase tracking-[0.16em]","border-line bg-surface-2 text-subtle")}>
                  <th className="px-4 py-3">Login</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Commission</th>
                  <th className="px-4 py-3">Min Invest</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Ago</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedRows.map((row, index) => {
                  const createdTime = pickCreatedTime(row);
                  const login = pickLogin(row);

                  return (
                    <tr key={`${login}-${index}`} className={cx("border-t","border-line")}>
                      <td data-label="Login" className="whitespace-nowrap px-4 py-4 font-black">#{login}</td>
                      <td data-label="Name" className="whitespace-nowrap px-4 py-4">{valueOf(row, ["name", "Name", "nickname"], "-")}</td>
                      <td data-label="Commission" className="whitespace-nowrap px-4 py-4">{valueOf(row, ["commission", "Commission"], 0)}%</td>
                      <td data-label="Min Invest" className="whitespace-nowrap px-4 py-4">${valueOf(row, ["min_invest", "minInvest", "minimumInvestment"], 0)}</td>
                      <td data-label="Created" className="whitespace-nowrap px-4 py-4">{createdTime ? new Date(createdTime).toLocaleString() : "-"}</td>
                      <td data-label="Ago" className="whitespace-nowrap px-4 py-4 font-bold text-success">{formatAgo(createdTime)}</td>
                      <td data-label="Actions" className="whitespace-nowrap px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="rounded-card border border-success bg-success-soft px-3 py-2 text-success"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMaster(row)}
                            className="rounded-card border border-danger bg-danger-soft px-3 py-2 text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={cx("text-sm","text-subtle")}>
          Page <b>{safePage}</b> / <b>{totalPages}</b> · Showing {paginatedRows.length} of {rows.length}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={safePage === 1}
            className="rounded-card border border-success px-4 py-2 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safePage === totalPages}
            className="rounded-card border border-success px-4 py-2 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminMasters;