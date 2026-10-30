import React from "react";
import { Activity } from "lucide-react";

const RecentActivities = () => (
  <div className="bg-surface rounded-card p-6">
    <h3 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
      <Activity className="text-success" /> Recent Activities
    </h3>
    <p className="text-sm text-subtle">This section will show recent logs/changes soon.</p>
  </div>
);

export default RecentActivities;
