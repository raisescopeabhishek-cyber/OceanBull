import React from "react";
import { Activity } from "lucide-react";

const RecentActivities = () => (
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <Activity className="text-green-600" /> Recent Activities
    </h3>
    <p className="text-sm text-gray-500">This section will show recent logs/changes soon.</p>
  </div>
);

export default RecentActivities;
