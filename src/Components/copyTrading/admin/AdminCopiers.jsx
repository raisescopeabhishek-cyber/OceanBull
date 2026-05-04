import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Link2,
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
  pickCopierLogin,
  pickCreatedTime,
  pickMasterLogin,
  safeArray,
  valueOf,
} from "./adminCopyTradingHelpers";

const PAGE_SIZE = 10;

const emptyForm = {
  masterAccount: "",
  copierAccount: "",
  name: "",
  copyType: "",
  commission: "",
};

const CopierModal = ({ isDark, open, mode, form, setForm, loading, onClose, onSubmit }) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div
        className={cx(
          "w-full max-w-xl rounded-[28px] border p-5 shadow-2xl",
          isDark ? "border-white/10 bg-slate-950 text-white" : "border-emerald-100 bg-white text-slate-950"
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-black">
            {mode === "edit" ? "Update Copier" : "Link Copier"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={cx(
              "rounded-xl border p-2",
              isDark ? "border-white/10 hover:bg-white/10" : "border-emerald-100 hover:bg-emerald-50"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            ["masterAccount", "Master Account"],
            ["copierAccount", "Copier Account"],
            ["name", "Copier Name"],
            ["copyType", "Copy Type"],
            ["commission", "Commission"],
          ].map(([key, label]) => (
            <label key={key} className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-600">
                {label}
              </span>

              <input
                value={form[key]}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, [key]: event.target.value }))
                }
                className={cx(
                  "w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none",
                  isDark
                    ? "border-white/10 bg-slate-900 text-white"
                    : "border-emerald-100 bg-white text-slate-900"
                )}
              />
            </label>
          ))}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={cx(
              "rounded-2xl border px-5 py-3 text-sm font-bold",
              isDark ? "border-white/10 hover:bg-white/10" : "border-emerald-100 hover:bg-emerald-50"
            )}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Saving..." : mode === "edit" ? "Update Copier" : "Link Copier"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const AdminCopiers = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [copiers, setCopiers] = useState([]);
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
      const res = await copyTradingApi.adminGetCopiers();
      setCopiers(safeArray(res));
      setPage(1);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to load copiers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return copiers
      .filter((row) => {
        if (!q) return true;
        return JSON.stringify(row || {}).toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (sortBy === "oldest") return pickCreatedTime(a) - pickCreatedTime(b);
        if (sortBy === "copierAsc") return Number(pickCopierLogin(a) || 0) - Number(pickCopierLogin(b) || 0);
        if (sortBy === "copierDesc") return Number(pickCopierLogin(b) || 0) - Number(pickCopierLogin(a) || 0);
        if (sortBy === "masterAsc") return Number(pickMasterLogin(a) || 0) - Number(pickMasterLogin(b) || 0);
        if (sortBy === "masterDesc") return Number(pickMasterLogin(b) || 0) - Number(pickMasterLogin(a) || 0);
        return pickCreatedTime(b) - pickCreatedTime(a);
      });
  }, [copiers, search, sortBy]);

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
      masterAccount: pickMasterLogin(row),
      copierAccount: pickCopierLogin(row),
      name: valueOf(row, ["name", "Name"], ""),
      copyType: valueOf(row, ["copyType", "CopyType"], ""),
      commission: valueOf(row, ["commission", "Commission"], ""),
    });
    setModalOpen(true);
  };

  const submitForm = async () => {
    if (!form.masterAccount || !form.copierAccount) {
      toast.error("Master and copier account are required.");
      return;
    }

    try {
      setActionLoading(true);

      if (modalMode === "edit") {
        await copyTradingApi.adminUpdateCopier(form);
        toast.success("Copier updated successfully");
      } else {
        await copyTradingApi.adminLinkCopier(form);
        toast.success("Copier linked successfully");
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

  const deleteCopier = async (row) => {
    const copierAccount = pickCopierLogin(row);
    const masterAccount = pickMasterLogin(row);

    if (!window.confirm(`Delete copier #${copierAccount}?`)) return;

    try {
      setActionLoading(true);
      await copyTradingApi.adminDeleteCopier({
        masterAccount,
        copierAccount,
        mt5Account: copierAccount,
        MT5Account: copierAccount,
      });
      toast.success("Copier deleted successfully");
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
      <CopierModal
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
          <h1 className="text-2xl font-black">Copiers CRUD</h1>
          <p className={cx("mt-1 text-sm", isDark ? "text-white/50" : "text-slate-500")}>
            Manage copier links and mapping.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Link Copier
        </button>
      </div>

      <div
        className={cx(
          "grid grid-cols-1 gap-3 rounded-[22px] border p-4 md:grid-cols-[1fr_220px_auto]",
          isDark ? "border-white/10 bg-white/[0.035]" : "border-emerald-100 bg-white/95"
        )}
      >
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-slate-900">
          <Search className="h-4 w-4 text-emerald-600" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search copiers..."
            className="w-full bg-transparent text-sm font-semibold outline-none"
          />
        </div>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className={cx(
            "rounded-2xl border px-4 py-3 text-sm font-bold outline-none",
            isDark ? "border-white/10 bg-slate-950 text-white" : "border-emerald-100 bg-white text-slate-900"
          )}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="copierAsc">Copier ↑</option>
          <option value="copierDesc">Copier ↓</option>
          <option value="masterAsc">Master ↑</option>
          <option value="masterDesc">Master ↓</option>
        </select>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className={cx(
            "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold",
            isDark ? "border-white/10 bg-white/[0.04] text-white" : "border-emerald-100 bg-white text-emerald-700"
          )}
        >
          <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-5 text-sm">Loading copiers...</div>
      ) : !rows.length ? (
        <CopyTradingEmptyState
          isDark={isDark}
          title="No copiers found"
          subtitle="Try changing search filters."
        />
      ) : (
        <div
          className={cx(
            "overflow-hidden rounded-[24px] border",
            isDark ? "border-white/10 bg-white/[0.03]" : "border-emerald-100 bg-white/95"
          )}
        >
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead>
                <tr className={cx("border-b text-xs uppercase tracking-[0.16em]", isDark ? "border-white/10 bg-white/[0.035] text-white/45" : "border-emerald-100 bg-emerald-50/80 text-slate-500")}>
                  <th className="px-4 py-3">Copier</th>
                  <th className="px-4 py-3">Master</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Copy Type</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Ago</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedRows.map((row, index) => {
                  const createdTime = pickCreatedTime(row);
                  const copierAccount = pickCopierLogin(row);

                  return (
                    <tr key={`${copierAccount}-${index}`} className={cx("border-t", isDark ? "border-white/10" : "border-emerald-100")}>
                      <td className="whitespace-nowrap px-4 py-4 font-black">#{copierAccount}</td>
                      <td className="whitespace-nowrap px-4 py-4 font-bold">#{pickMasterLogin(row)}</td>
                      <td className="whitespace-nowrap px-4 py-4">{valueOf(row, ["name", "Name"], "-")}</td>
                      <td className="whitespace-nowrap px-4 py-4">{valueOf(row, ["copyType", "CopyType"], "-")}</td>
                      <td className="whitespace-nowrap px-4 py-4">{createdTime ? new Date(createdTime).toLocaleString() : "-"}</td>
                      <td className="whitespace-nowrap px-4 py-4 font-bold text-emerald-600">{formatAgo(createdTime)}</td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-700"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCopier(row)}
                            className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-red-600"
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
        <p className={cx("text-sm", isDark ? "text-white/50" : "text-slate-500")}>
          Page <b>{safePage}</b> / <b>{totalPages}</b> · Showing {paginatedRows.length} of {rows.length}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={safePage === 1}
            className="rounded-xl border border-emerald-100 px-4 py-2 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safePage === totalPages}
            className="rounded-xl border border-emerald-100 px-4 py-2 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCopiers;