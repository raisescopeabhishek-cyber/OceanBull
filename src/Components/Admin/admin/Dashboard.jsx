import UserReport from "@/Components/Admin/Dashboard/UserReport";
import BrowserGraph from "../../Components/Admin/Dashboard/BrowserGraph";
import CountryGraph from "../../Components/Admin/Dashboard/CountryGraph";
import OsGraph from "../../Components/Admin/Dashboard/OsGraph";
import DepositWithdrawReport from "@/Components/Admin/Dashboard/DepositWithdrawReport";
import WithdrawalReport from "@/Components/Admin/Dashboard/WithdrawalReport";
import IBWithdrawalReport from "@/Components/Admin/Dashboard/IbWithdrawalRepport";
import Mt5AccountsReport from "@/Components/Admin/Dashboard/Mt5AccountsReport";

export default function Dashboard() {
  return (
    <div className="">
      <h2 className="text-muted text-3xl px-10 py-3 font-bold">
        Dashboard
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-5 px-5">
        <UserReport></UserReport>
        <DepositWithdrawReport></DepositWithdrawReport>
        {/* <WithdrawalReport></WithdrawalReport> */}
        <IBWithdrawalReport></IBWithdrawalReport>
        <Mt5AccountsReport></Mt5AccountsReport>
      </div>
      <div className="px-5 grid grid-cols-1 md:grid-cols-3 my-10 gap-2">
        <BrowserGraph></BrowserGraph>
        <OsGraph></OsGraph>
        <CountryGraph></CountryGraph>
      </div>
    </div>
  );
}
