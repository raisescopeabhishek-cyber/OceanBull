import { Banknote, Award, PlusCircle, BadgeMinus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

// @/components/ui/alert-dialog
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { copyApi } from "../../../utils/apiClients";

const UserMasterUserCT = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [masterUser, setMasterUser] = useState(null);
  const [linkedAccounts, setLinkedAccounts] = useState(null);
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const accountNumbers = loggedUser?.accounts?.map(
    (value) => value.accountNumber
  );

  const { id } = useParams();
  // fetch all linked to master user ----------------
  const fetchLinked = async () => {
    try {
      const { data } = await copyApi.post(
        `/getAllMasterAndLinkedAccountsByManagerIndex`,
        {
          Manager_Index: import.meta.env.VITE_COPY_MANAGER_INDEX,
          accounts: accountNumbers,
        }
      );
      // console.log(data.data);
      const linkedAccounts = data?.data?.linkedAccounts?.map(
        (value) => value.login
      );
      console.log("linked accounts", linkedAccounts);
      setLinkedAccounts(linkedAccounts);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch details");
    }
  };
  // fetch master user ----------------
  const fetchMasterUser = async () => {
    try {
      const { data } = await copyApi.get(
        `/getMasterDetailsByAccount?MT5Account=${id}`
      );
      // console.log(data);
      setMasterUser(data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch details");
    }
  };

  // console.log("linked accountsss", linkedAccounts);

  // join to master ------------------
  const joinToMaster = async (accountNumber) => {
    // console.log(accountNumber);
    const toastId = toast.loading("Joining.. please wait..");
    try {
      const res = await copyApi.post(`/addAccountToMasterAccount`, {
        userId: 1,
        mt5Account: accountNumber,
        masterAccount: id,
      });
      fetchLinked();
      toast.success("Successfully Joined", { id: toastId });
      // console.log("res", res);
    } catch (error) {
      toast.error(` ${error.response.data.message || "Failed to join"}`, {
        id: toastId,
      });

      console.log(error);
    }
  };
  // remove from master ------------------
  const removeFromMaster = async (accountNumber) => {
    // console.log(accountNumber);
    const toastId = toast.loading("Removing.. please wait..");
    try {
      const res = await copyApi.post(`/deleteUserAccount`, {
        mt5Account: accountNumber,
      });
      fetchLinked();
      toast.success("Successfully Removed", { id: toastId });
      // console.log("res", res);
    } catch (error) {
      toast.error(` ${error.response.data.message || "Failed to join"}`, {
        id: toastId,
      });

      console.log(error);
    }
  };
  // console.log(masterUser);

  // use effect --------------------
  useEffect(() => {
    fetchMasterUser();
    fetchLinked();
  }, []);

  return (
    <div className="w-full p-4 sm:p-6 bg-secondary-800/40 rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        {/* Profile Section */}
        <div className="flex sm:flex-col items-center gap-2 sm:space-y-2">
          <div className="p-3 bg-secondary-500-10 rounded-full">
            <Banknote className="w-6 h-6 sm:w-8 sm:h-8 text-secondary-500" />
          </div>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <Award className="w-4 h-4" />
            <span>High achiever</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4 sm:space-y-6 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-0 sm:justify-between">
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold">{masterUser?.name}</h2>
              <p className="text-sm text-gray-300">Minimum investment $32</p>
            </div>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="w-full sm:w-auto px-6 py-2 text-gray-100 font-semibold bg-secondary-500 rounded-lg hover:bg-secondary-500-80 transition-colors"
            >
              SET UP COPYING
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-gray-200">
                Risk score
              </div>
              <div className="flex items-center gap-1">
                <div className="px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full text-sm">
                  1 Risk
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-200">Equity</div>
              <div className="font-medium">${216.4}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-200">Commission</div>
              <div className="font-medium">38%</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-200">With Us</div>
              <div className="font-medium">309d</div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-gray-200">Strategy Description</h3>
            <p className="text-sm text-gray-300">
              With over 8 years of experience in forex trading our strategy
              focuses on achieving steady and realistic profits while minimizing
              risks.
            </p>
          </div>
        </div>
      </div>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {isDialogOpen && (
          <AlertDialogContent>
            {/* Dialog content remains the same */}
            <AlertDialogHeader>
              <AlertDialogTitle className=" ">
                {"Setup With Your Account"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                <div className="mt-4 space-y-4">
                  {loggedUser?.accounts?.map((account) => (
                    <div
                      key={account?.accountNumber}
                      className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-secondary-800/40"
                    >
                      {/* Account Information */}
                      <div>
                        <h2 className="text-lg font-semibold text-gray-100">
                          Account #{account?.accountNumber}
                        </h2>
                        <p className="text-sm text-gray-200">
                          {account?.accountType || "Account Type Unavailable"}
                        </p>
                      </div>

                      {/* Join Button */}
                      <button
                        onClick={() => {
                          if (
                            linkedAccounts?.includes(
                              Number(account?.accountNumber)
                            )
                          ) {
                            removeFromMaster(Number(account?.accountNumber));
                          } else {
                            joinToMaster(account?.accountNumber);
                          }
                        }}
                        className="bg-secondary-500 flex items-center gap-1 text-white px-5 py-2 rounded-full shadow-md hover:bg-secondary-500-80 focus:ring-2 focus:ring-secondary-300 transition"
                      >
                        {linkedAccounts?.includes(
                          Number(account?.accountNumber)
                        ) ? (
                          <>
                            <BadgeMinus className="w-4 h-4" /> Remove
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-4 h-4" /> Add
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </div>
  );
};

export default UserMasterUserCT;
