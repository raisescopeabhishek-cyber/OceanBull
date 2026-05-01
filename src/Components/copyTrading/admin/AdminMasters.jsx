import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Plus, RefreshCw, Save, Trash2 } from "lucide-react";

import { copyTradingApi } from "../api/copyTradingApi";
import {
  asArray,
  cx,
  getNestedUser,
  getUserIdFromUser,
  pickMasterAccount,
  pickName,
} from "../utils/copyTradingHelpers";
import CopyTradingTable from "../shared/CopyTradingTable";
import CopyTradingEmptyState from "../shared/CopyTradingEmptyState";

const AdminMasters = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminUserId, setAdminUserId] = useState("");

  const [form, setForm] = useState({
    mt5Account: "",
    commission: "",
    nickname: "",
    min_invest: "",
    description: "",
    chat_link: "",
  });

  const onChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const loadMasters = async () => {
    try {
      setLoading(true);

      const [meRes, mastersRes] = await Promise.all([
        copyTradingApi.getMeUser().catch(() => null),
        copyTradingApi.adminGetMasters(),
      ]);

      const me = getNestedUser(meRes);
      setAdminUserId(getUserIdFromUser(me));

      setMasters(asArray(mastersRes));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load masters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasters();
  }, []);

  const addMaster = async () => {
    if (!form.mt5Account) {
      toast.error("MT5 account is required");
      return;
    }

    try {
      await copyTradingApi.adminAddMaster({
        userId: adminUserId,
        mt5Account: form.mt5Account,
      });

      toast.success("Master added successfully");
      loadMasters();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add master");
    }
  };

  const updateMaster = async () => {
    if (!form.mt5Account) {
      toast.error("MT5 account is required");
      return;
    }

    try {
      await copyTradingApi.adminUpdateMaster({
        masterAccount: form.mt5Account,
        commission: form.commission,
        nickname: form.nickname,
        min_invest: form.min_invest,
        description: form.description,
        chat_link: form.chat_link,
      });

      toast.success("Master updated successfully");
      loadMasters();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update master");
    }
  };

  const deleteMaster = async (master) => {
    const masterAccount = pickMasterAccount(master);

    if (!masterAccount) {
      toast.error("Master account not found");
      return;
    }

    try {
      await copyTradingApi.adminDeleteMaster({ masterAccount });
      toast.success("Master deleted successfully");
      loadMasters();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete master");
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
        <h3
          className={cx(
            "mb-4 text-base font-bold",
            isDark ? "text-white" : "text-slate-900"
          )}
        >
          Add / Update Master
        </h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            className="rounded-2xl border px-4 py-3 text-sm outline-none"
            placeholder="MT5 Account"
            value={form.mt5Account}
            onChange={(event) => onChange("mt5Account", event.target.value)}
          />

          <input
            className="rounded-2xl border px-4 py-3 text-sm outline-none"
            placeholder="Nickname"
            value={form.nickname}
            onChange={(event) => onChange("nickname", event.target.value)}
          />

          <input
            className="rounded-2xl border px-4 py-3 text-sm outline-none"
            placeholder="Commission %"
            value={form.commission}
            onChange={(event) => onChange("commission", event.target.value)}
          />

          <input
            className="rounded-2xl border px-4 py-3 text-sm outline-none"
            placeholder="Minimum Investment"
            value={form.min_invest}
            onChange={(event) => onChange("min_invest", event.target.value)}
          />

          <input
            className="rounded-2xl border px-4 py-3 text-sm outline-none"
            placeholder="Chat Link"
            value={form.chat_link}
            onChange={(event) => onChange("chat_link", event.target.value)}
          />

          <input
            className="rounded-2xl border px-4 py-3 text-sm outline-none"
            placeholder="Description"
            value={form.description}
            onChange={(event) => onChange("description", event.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={addMaster}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            <Plus className="h-4 w-4" />
            Add Master
          </button>

          <button
            type="button"
            onClick={updateMaster}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
          >
            <Save className="h-4 w-4" />
            Update Details
          </button>

          <button
            type="button"
            onClick={loadMasters}
            className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-5 text-sm">Loading masters...</div>
      ) : masters.length === 0 ? (
        <CopyTradingEmptyState isDark={isDark} title="No masters found" />
      ) : (
        <CopyTradingTable
          isDark={isDark}
          columns={[
            "Master Account",
            "Nickname",
            "Commission",
            "Min Invest",
            "Description",
            "Action",
          ]}
          rows={masters}
          minWidth="1150px"
          renderRow={(row, index) => {
            const masterAccount = pickMasterAccount(row) || "-";

            return (
              <tr
                key={`${masterAccount}-${index}`}
                className={cx(
                  "border-t",
                  isDark ? "border-white/10" : "border-emerald-100"
                )}
              >
                <td className="px-4 py-4 font-bold">#{masterAccount}</td>
                <td className="px-4 py-4">{pickName(row)}</td>
                <td className="px-4 py-4">
                  {row?.commission || row?.Commission || 0}%
                </td>
                <td className="px-4 py-4">
                  ${row?.min_invest || row?.minInvest || row?.minimumInvestment || 0}
                </td>
                <td className="px-4 py-4">{row?.description || row?.Description || "-"}</td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => deleteMaster(row)}
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

export default AdminMasters;