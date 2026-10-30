import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Pages
import UserDashboard from "./UserDashboard";
import UserReferal from "./UserReferals";
import { UserReferralWithdrawal } from "./referral/UserReferalWithdrwal";
import UserReferalWithdrwalHistory from "./referral/UserReferalWithdrwalHistory";
import UserReferralsDetails from "./referral/UserReferralsDetails";
import UserWithdraw from "./UserWithdraw";
import UserPlatform from "./UserPlatform";
import UserEconomicCalendar from "./UserEconomicCalendar";
import UserNewChallenge from "./UserNewChallenge";
import UserProfile from "./UserProfile";
import UserChnagePassword from "./UserChnagePassword";
import UserMasterPassword from "./UserMasterPassword";
import UserInvesterPassword from "./UserInvestorPassword";
import UserTradeHistory from "./UserTradeHistory";
import UserChallenges from "./UserChallenges";
import UserAccountDetails from "./UserAccountDetails";
import UserDeposit from "./Deposite/UserDeposit";
import UserTransfer from "./UserTransfer";
import UserForexNews from "./UserForexNews";
import UserReferralCloseTrades from "./referral/UserReferralCloseTrades";
import UserCopyTrading from "./UserCopyTrading";
import UserMasterUserCT from "./UserMasterUserCT";
import UserCopyRequest from "./UserCopyRequest";
import UserSignUp from "./UserSignUp";
import UserVerify from "./UserVerify";
import UserLogin from "./UserLogin";
import UserResetPassword from "./UserResetPassword";
import UserPendingReferrals from "./referral/UserPendingReferrals";
import UserTransaction from "./UserTransaction";
import Sidebar from "./SideBar";
import UserSidebar from "./UserSidebar";
import TicketsDashboard from "./customerSupport/TicketsDashboard";
import UserCustomerSupport from "./customerSupport/UserCustomerSupport";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserNotifications } from "../utils/authService";
import { setNotification } from "../../redux/user/userSlice";
import UserHeader from "./Header/UserHeader";

const UserDashboardRouting = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const loggedUser = useSelector((store) => store.user.loggedUser);

  const fetchNotifications = async () => {
    const response = await fetchUserNotifications(loggedUser?._id);
    console.log(response);
    if (response.success) dispatch(setNotification(response.data));
  };
  useEffect(() => {
    fetchNotifications();
  }, [location, loggedUser?._id]);
  return (
    <div className="text-text h-screen overflow-hidden">
      <UserHeader className="fixed top-0 w-full z-10" />
      <div className="flex h-full">
        <UserSidebar className="fixed left-0 z-10" />
        <div className="w-full user-custom-scrollbar overflow-y-auto bg-surface h-screen">
          <Routes>
            <Route path="/" element={<UserDashboard />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/new-challenge" element={<UserNewChallenge />} />
            <Route path="/challenges" element={<UserChallenges />} />
            <Route path="/transaction" element={<UserTransaction />} />
            <Route path="/trade-history" element={<UserTradeHistory />} />
            <Route path="/deposit" element={<UserDeposit />} />
            <Route path="/transfer" element={<UserTransfer />} />
            <Route path="/withdraw" element={<UserWithdraw />} />
            <Route path="/referrals" element={<UserReferal />} />
            <Route path="/platform" element={<UserPlatform />} />
            <Route
              path="/economic-calendar"
              element={<UserEconomicCalendar />}
            />

            <Route path="/profile" element={<UserProfile />} />
            <Route path="/account-details" element={<UserAccountDetails />} />
            <Route path="/change-password" element={<UserChnagePassword />} />
            <Route path="/master-password" element={<UserMasterPassword />} />









           
            <Route
              path="/investor-password"
              element={<UserInvesterPassword />}
            />

            <Route path="/customer-support" element={<UserCustomerSupport />} />

            <Route path="/ticketDashboard" element={<TicketsDashboard />} />
            <Route
              path="/ticketDashboard/ticket/:ticketId"
              element={<TicketsDashboard />}
            />
            <Route
              path="/ticketDashboard/ticket/:ticketId/chat/:chatId"
              element={<TicketsDashboard />}
            />

            {/* user/ticketDashboard/ticket/68a80ab25911f0b9b0ae7c51/chat/123 */}

            <Route path="/forex-news" element={<UserForexNews />} />

            {/* TicketsDashboard */}
            <Route
              path="/referral-close-trades/:id"
              element={<UserReferralCloseTrades />}
            />
            <Route path="/copy-trading" element={<UserCopyTrading />} />
            <Route
              path="/copy-trading/master-user/:id"
              element={<UserMasterUserCT />}
            />
            <Route path="/copy-request" element={<UserCopyRequest />} />

            {/* Auth & Verification */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardRouting;
