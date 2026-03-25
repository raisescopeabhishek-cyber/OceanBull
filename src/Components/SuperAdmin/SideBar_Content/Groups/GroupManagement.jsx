import React, { useState } from "react";
import Group from "./Group";
import AddGroup from "./AddGroup";

export default function GroupManagement() {
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="space-y-10 w-full">
      <AddGroup refresh={refresh} setRefresh={setRefresh} />
      <Group refresh={refresh} />
    </div>
  );
}
