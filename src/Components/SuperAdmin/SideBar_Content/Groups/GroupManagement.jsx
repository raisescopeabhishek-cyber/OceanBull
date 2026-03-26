import React, { useState } from "react";
import Group from "./Group";
import AddGroup from "./AddGroup";

export default function GroupManagement() {
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <AddGroup refresh={refresh} setRefresh={setRefresh} />
      <Group refresh={refresh} />
    </div>
  );
}