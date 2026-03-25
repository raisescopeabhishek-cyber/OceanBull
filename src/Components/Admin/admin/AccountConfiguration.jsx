import AccountGroup from "../../Admin/account-configuration/AccountGroup";

import AccountTypes from "../../Admin/account-configuration/AccountType";
import CustomGroupList from "../../Admin/account-configuration/CustomGroupList";
import PlatformConfiguration from "../../Admin/account-configuration/PlatformConfiguration";
import { Divider } from "../Divider";
import { useEffect, useState } from "react";
import { MainDivider } from "../../lib/MainDevider";
export default function AccountConfiguration() {
  const [refresh, setRefresh] = useState(false);
  useEffect(() => {}, [refresh]);
  return (
    <div>
      <PlatformConfiguration></PlatformConfiguration>
      <Divider></Divider>
      <div className=" bg-primary-700/40  shadow-2xl">
        <AccountGroup refresh={refresh} setRefresh={setRefresh}></AccountGroup>
        <CustomGroupList
          refresh={refresh}
          setRefresh={setRefresh}
        ></CustomGroupList>
      </div>
      <Divider></Divider>

      <AccountTypes></AccountTypes>
    </div>
  );
}
