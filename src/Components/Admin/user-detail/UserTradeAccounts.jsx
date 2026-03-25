import { useState } from "react";
import {
  CFcalculateTimeSinceJoined,
  CFformatDate,
} from "../../../utils/CustomFunctions";
import { Pencil, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { adminApi } from "../../../utils/apiClients";
import toast from "react-hot-toast";

const UserTradeAccounts = ({ userData, fetchUserData }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activeTab, setActiveTab] = useState("master");
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [error, setError] = useState("");

  const handleOpenDialog = (account) => {
    setSelectedAccount(account);
    setPasswords({ new: "", confirm: "" });
    setError("");
    setOpenDialog(true);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Please wait...");

    // Validate new password
    if (!validatePassword(passwords.new)) {
      setError(
        "Password must be at least 8 characters long, including one uppercase letter, one lowercase letter, one number, and one special symbol."
      );
      toast.error("Invalid password format", { id: toastId });
      return;
    }

    // Validate confirm password
    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match. Please try again.");
      toast.error("Passwords do not match", { id: toastId });
      return;
    }

    try {
      // Determine API endpoint based on active tab
      // const endpoint =
      //   activeTab === "master"
      //     ? `/ChangeMasterPassword?Manager_Index=${
      //         import.meta.env.VITE_MANAGER_INDEX
      //       }&Account=${selectedAccount.accountNumber}&password=${
      //         passwords.confirm
      //       }`
      //     : `/ChangeMasterPassword?Manager_Index=${
      //         import.meta.env.VITE_MANAGER_INDEX
      //       }&Account=${selectedAccount.accountNumber}&password=${
      //         passwords.confirm
      //       }`;



            const endpoint =
        activeTab === "master"
          ? `/server-master-password-change?Account=${selectedAccount.accountNumber}&password=${
              passwords.confirm
            }`
          : `/server-master-password-change?Account=${selectedAccount.accountNumber}&password=${
              passwords.confirm
            }`;




      const res = await adminApi.get(endpoint);

      // Update backend with new password
      const backendRes = await adminApi.post(
        `/${
          activeTab === "master"
            ? "update-master-password"
            : "update-investor-password"
        }`,
        {
          userId: userData._id,
          accountId: selectedAccount._id,
          newPassword: passwords.confirm,
        }
      );
      fetchUserData();
      toast.success(res.data.MESSAGE, { id: toastId });
      setOpenDialog(false);
    } catch (error) {
      console.log("error", error);
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.", { id: toastId });
    }

    setPasswords({ new: "", confirm: "" });
  };

  return (
    <div className="mx-auto mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">User Accounts</h2>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-primary-500 whitespace-nowrap rounded text-white">
              <th className="p-2 sm:p-3 text-left font-semibold rounded-tl-lg">
                AC NO:
              </th>
              <th className="p-2 sm:p-3 text-center font-semibold">Type</th>
              <th className="p-2 sm:p-3 text-center font-semibold">Leverage</th>
              <th className="p-2 sm:p-3 text-center font-semibold">
                MasterPassword
              </th>
              <th className="p-2 sm:p-3 text-center font-semibold">
                InvestorPassword
              </th>
              <th className="p-2 sm:p-3 text-center font-semibold">Platform</th>
              <th className="p-2 sm:p-3 text-center font-semibold">
                Timestamp
              </th>
              <th className="p-2 sm:p-3 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {userData?.accounts?.map((value, index) => (
              <tr
                key={index}
                className="border-b whitespace-nowrap border-secondary-700/50 hover:bg-primary-500/20 transition-colors"
              >
                <td className="p-2 sm:p-3 text-sm sm:text-base">
                  {value?.accountNumber}
                </td>
                <td className="p-2 sm:p-3 text-sm sm:text-base text-center">
                  {value?.accountType}
                </td>
                <td className="p-2 text-center sm:p-3 text-sm sm:text-base">
                  {value?.leverage}
                </td>
                <td className="p-2 text-center sm:p-3 text-sm sm:text-base">
                  {value?.masterPassword}
                </td>
                <td className="p-2 text-center sm:p-3 text-sm sm:text-base">
                  {value?.investorPassword}
                </td>
                <td className="p-2 text-center sm:p-3 text-sm sm:text-base">
                  {value?.platform || "N/A"}
                </td>
                <td className="py-3 text-center px-4">
                  <div>{CFformatDate(value?.createdAt)}</div>
                  <div className="text-sm text-gray-400">
                    {CFcalculateTimeSinceJoined(value?.createdAt)}
                  </div>
                </td>
                <td className="p-2 text-center sm:p-3 text-sm sm:text-base">
                  <button
                    onClick={() => handleOpenDialog(value)}
                    className="bg-blue-500/20 hover:bg-blue-500/40 transition-all rounded-full p-1 flex justify-center items-center"
                  >
                    <Pencil className="text-blue-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog for Password Change */}
      <Dialog.Root open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900/85 border border-gray-700/50 rounded-xl p-6 w-full max-w-md shadow-2xl z-50">
            <Dialog.Title className="text-lg font-semibold text-white mb-4">
              Change Password for Account {selectedAccount?.accountNumber}
            </Dialog.Title>
            <button
              onClick={() => setOpenDialog(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            {/* Tabs */}
            <div className="flex border-b border-gray-700 mb-4">
              <button
                onClick={() => setActiveTab("master")}
                className={`flex-1 py-2 text-sm font-medium text-center transition-colors ${
                  activeTab === "master"
                    ? "text-white border-b-2 border-blue-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Master Password
              </button>
              <button
                onClick={() => setActiveTab("investor")}
                className={`flex-1 py-2 text-sm font-medium text-center transition-colors ${
                  activeTab === "investor"
                    ? "text-white border-b-2 border-blue-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Investor Password
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  New {activeTab === "master" ? "Master" : "Investor"} Password
                </label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                onClick={handlePasswordChange}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                Change Password
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default UserTradeAccounts;
