import UserReport from "@/components/admin/Dashboard/UserReport";
import BrowserGraph from "../../components/admin/Dashboard/BrowserGraph";
import CountryGraph from "../../components/admin/Dashboard/CountryGraph";
import OsGraph from "../../components/admin/Dashboard/OsGraph";
import DepositWithdrawReport from "@/components/admin/Dashboard/DepositWithdrawReport";
import WithdrawalReport from "@/components/admin/Dashboard/WithdrawalReport";
import IBWithdrawalReport from "@/components/admin/Dashboard/IbWithdrawalRepport";
import Mt5AccountsReport from "@/components/admin/Dashboard/Mt5AccountsReport";

export default function Dashboard() {
  return (
    <div className="">
      <h2 className=" text-neutral-300  text-3xl px-10 py-3 font-bold">
        Dashboard
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-5 px-5 ">
        <UserReport></UserReport>
        <DepositWithdrawReport></DepositWithdrawReport>
        {/* <WithdrawalReport></WithdrawalReport> */}
        <IBWithdrawalReport></IBWithdrawalReport>
        <Mt5AccountsReport></Mt5AccountsReport>
      </div>
      <div className=" px-5 grid grid-cols-1 md:grid-cols-3 my-10 gap-2">
        <BrowserGraph></BrowserGraph>
        <OsGraph></OsGraph>
        <CountryGraph></CountryGraph>
      </div>
    </div>
  );
}
