import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Copy, RadioTower, Server, UserRoundCog } from "lucide-react";
import toast from "react-hot-toast";

import { copyTradingApi } from "../api/copyTradingApi";
import { asArray, cx, formatNumber } from "../utils/copyTradingHelpers";

const StatCard = ({ isDark, icon, label, value }) => (
  <div
    className={cx(
      "rounded-2xl border p-4",
      isDark
        ? "border-white/10 bg-white/[0.035]"
        : "border-emerald-100 bg-white/90 shadow-[0_10px_24px_rgba(16,185,129,0.07)]"
    )}
  >
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
        {icon}
      </div>
      <div>
        <p className={cx("text-xs", isDark ? "text-white/50" : "text-slate-500")}>
          {label}
        </p>
        <p
          className={cx(
            "mt-1 text-lg font-bold",
            isDark ? "text-white" : "text-slate-900"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  </div>
);

const AdminCopyTradingDashboard = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [masters, setMasters] = useState([]);
  const [copyUsers, setCopyUsers] = useState([]);
  const [servers, setServers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [mastersRes, usersRes, serversRes] = await Promise.all([
          copyTradingApi.adminGetMasters(),
          copyTradingApi.adminGetCopyUsers(),
          copyTradingApi.adminGetServers(),
        ]);

        setMasters(asArray(mastersRes));
        setCopyUsers(asArray(usersRes));
        setServers(asArray(serversRes));
      } catch (error) {
        console.error(error);
        toast.error("Failed to load admin copy trading dashboard");
      }
    };

    load();
  }, []);

  const summary = useMemo(
    () => ({
      masters: masters.length,
      copyUsers: copyUsers.length,
      servers: servers.length,
      active: masters.length + copyUsers.length,
    }),
    [masters, copyUsers, servers]
  );

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          isDark={isDark}
          icon={<UserRoundCog className="h-5 w-5" />}
          label="Masters"
          value={formatNumber(summary.masters)}
        />

        <StatCard
          isDark={isDark}
          icon={<Copy className="h-5 w-5" />}
          label="Copy Users"
          value={formatNumber(summary.copyUsers)}
        />

        <StatCard
          isDark={isDark}
          icon={<Server className="h-5 w-5" />}
          label="Servers"
          value={formatNumber(summary.servers)}
        />

        <StatCard
          isDark={isDark}
          icon={<RadioTower className="h-5 w-5" />}
          label="Active Records"
          value={formatNumber(summary.active)}
        />
      </div>
    </div>
  );
};

export default AdminCopyTradingDashboard;