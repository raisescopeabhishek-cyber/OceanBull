import React, { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Link2, Search, Trash2 } from "lucide-react";

import { copyTradingApi } from "../api/copyTradingApi";
import {
  asArray,
  cx,
  getNestedUser,
  getUserIdFromUser,
} from "../utils/copyTradingHelpers";
import CopyTradingTable from "../shared/CopyTradingTable";
import CopyTradingEmptyState from "../shared/CopyTradingEmptyState";

const AdminCopiers = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [copiersText, setCopiersText] = useState("");
  const [rows, setRows] = useState([]);

  const [linkForm, setLinkForm] = useState({
    userId: "",
    mt5Account: "",
    masterAccount: "",
    min_invest: "",
  });

  const ensureUserId = async () => {
    if (linkForm.userId) return linkForm.userId;

    try {
      const meRes = await copyTradingApi.getMeUser();
      const me = getNestedUser(meRes);
      return getUserIdFromUser(me);
    } catch {
      return "";
    }
  };

  const searchCopiers = async () => {
    const copiers = copiersText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!copiers.length) {
      toast.error("Enter copier account numbers");
      return;
    }

    try {
      const res = await copyTradingApi.adminCopiersDetails({ copiers });
      setRows(asArray(res));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch copiers");
    }
  };

  const linkCopier = async () => {
    if (!linkForm.mt5Account || !linkForm.masterAccount) {
      toast.error("Copier and master account are required");
      return;
    }

    try {
      const userId = await ensureUserId();

      await copyTradingApi.adminLinkCopierWithBalanceCheck({
        userId,
        mt5Account: linkForm.mt5Account,
        masterAccount: linkForm.masterAccount,
        min_invest: linkForm.min_invest || 0,
      });

      toast.success("Copier linked to master");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to link copier");
    }
  };

  const deleteCopier = async (row) => {
    const mt5Account = row?.MT5Account || row?.mt5Account || row?.account;

    if (!mt5Account) {
      toast.error("MT5 account not found");
      return;
    }

    try {
      await copyTradingApi.adminDeleteCopier({ mt5Account });
      toast.success("Copier removed");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove copier");
    }
  };

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <div
        className={cx(
          "rounded-[22px] border p-4",
          isDark
            ? "border-white/10 bg-white/[0.035]"
            : "border-emerald-100 bg-white/90"
        )}
      >
        <h3 className="mb-4 text-base font-bold">Link Copier To Master</h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <input
            className="rounded-2xl border px-4 py-3 text-sm outline-none"
            placeholder="User ID optional"
            value={linkForm.userId}
            onChange={(event) =>
              setLinkForm((prev) => ({ ...prev, userId: event.target.value }))
            }
          />

          <input
            className="rounded-2xl border px-4 py-3 text-sm outline-none"
            placeholder="Copier MT5 Account"
            value={linkForm.mt5Account}
            onChange={(event) =>
              setLinkForm((prev) => ({ ...prev, mt5Account: event.target.value }))
            }
          />

          <input
            className="rounded-2xl border px-4 py-3 text-sm outline-none"
            placeholder="Master Account"
            value={linkForm.masterAccount}
            onChange={(event) =>
              setLinkForm((prev) => ({
                ...prev,
                masterAccount: event.target.value,
              }))
            }
          />

          <input
            className="rounded-2xl border px-4 py-3 text-sm outline-none"
            placeholder="Min Invest"
            value={linkForm.min_invest}
            onChange={(event) =>
              setLinkForm((prev) => ({
                ...prev,
                min_invest: event.target.value,
              }))
            }
          />

          <button
            type="button"
            onClick={linkCopier}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white"
          >
            <Link2 className="h-4 w-4" />
            Link
          </button>
        </div>
      </div>

      <div
        className={cx(
          "grid grid-cols-1 gap-3 rounded-[22px] border p-4 md:grid-cols-[1fr_140px]",
          isDark
            ? "border-white/10 bg-white/[0.035]"
            : "border-emerald-100 bg-white/90"
        )}
      >
        <input
          value={copiersText}
          onChange={(event) => setCopiersText(event.target.value)}
          placeholder="Search copier accounts comma separated: 10000,35562"
          className="rounded-2xl border px-4 py-3 text-sm outline-none"
        />

        <button
          type="button"
          onClick={searchCopiers}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>

      {rows.length === 0 ? (
        <CopyTradingEmptyState
          isDark={isDark}
          title="No copier data loaded"
          subtitle="Search copier MT5 accounts to view details."
        />
      ) : (
        <CopyTradingTable
          isDark={isDark}
          columns={["MT5 Account", "Master", "Balance", "Equity", "Status", "Action"]}
          rows={rows}
          minWidth="1000px"
          renderRow={(row, index) => {
            const mt5Account = row?.MT5Account || row?.mt5Account || row?.account || "-";

            return (
              <tr
                key={`${mt5Account}-${index}`}
                className={cx(
                  "border-t",
                  isDark ? "border-white/10" : "border-emerald-100"
                )}
              >
                <td className="px-4 py-4 font-bold">#{mt5Account}</td>
                <td className="px-4 py-4">{row?.masterAccount || row?.Master || "-"}</td>
                <td className="px-4 py-4">{row?.Balance || row?.balance || "-"}</td>
                <td className="px-4 py-4">{row?.Equity || row?.equity || "-"}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
                    Active
                  </span>
                </td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => deleteCopier(row)}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          }}
        />
      )}
    </div>
  );
};

export default AdminCopiers;