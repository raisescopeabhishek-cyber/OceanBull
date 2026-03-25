import { ArrowRight } from "lucide-react";

import { PlusCircle, BadgeMinus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { copyApi } from "../../../utils/apiClients";

export default function UserMasterCT() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const [linkedAccounts, setLinkedAccounts] = useState([]);

  // fetch all masters ----------------
  const fetchLinked = async () => {
    try {
      const { data } = await copyApi.get(`/getAllMasters`);
      const linkedAccounts = data?.map((value) => value.login);
      setLinkedAccounts(linkedAccounts);
      // console.log("linked accounts", linkedAccounts);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch details");
    }
  };
  // become master ----
  const becomeMasterHandler = async (accountNumber) => {
    const toastId = toast.loading("Joining.. please wait..");
    try {
      const res = await copyApi.post(`/addMasterAccount`, {
        userId: 1,
        mt5Account: accountNumber,
      });
      fetchLinked();
      toast.success(`${res?.data?.message || "Successfully Joined"} `, {
        id: toastId,
      });
      // console.log("res", res.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to join";

      toast.error(errorMessage, { id: toastId });

      console.error("Error joining master:", error);
    }
  };
  // delete master ----
  const deleteToMasterHandler = async (accountNumber) => {
    const toastId = toast.loading("Removing.. please wait..");
    try {
      const res = await copyApi.post(`/deleteMasterAccount`, {
        masterccount: accountNumber,
      });
      fetchLinked();
      toast.success("Successfully Removed", { id: toastId });
    } catch (error) {
      toast.error(` ${error.response.data.message || "Failed to join"}`, {
        id: toastId,
      });

      console.log(error);
    }
  };

  // use effect --------
  useEffect(() => {
    fetchLinked();
  }, []);

  return (
    <div className="max-w-3xl px-6 py-12 mx-auto text-center">
      <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-200/90 sm:text-5xl md:text-6xl">
        <span className=" text-secondary-500"> Confident in your trades?</span>

        <span className="block mt-4">
          {" "}
          Monetize your skills by letting others copy you!
        </span>
      </h1>

      <p className="max-w-2xl mx-auto mb-8 text-lg text-gray-300/80">
        Turn your trading expertise into a source of passive income by allowing
        others to copy your moves and follow your performance.{" "}
      </p>

      <button
        onClick={() => setIsDialogOpen(true)}
        className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-secondary-500 rounded-full hover:px-10 transition-all hover:bg-secondary-500-80 focus:outline-none"
      >
        Become a Master
        <ArrowRight className="w-5 h-5 ml-2" />
      </button>
      {/* dialog box */}
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
                            if (
                              window.confirm("Are you sure want to remove ?")
                            ) {
                              deleteToMasterHandler(
                                Number(account?.accountNumber)
                              );
                            }
                          } else {
                            becomeMasterHandler(account?.accountNumber);
                          }
                        }}
                        className="bg-secondary-500 flex items-center gap-1 text-white px-5 py-2 rounded-full shadow-md hover:bg-secondary-500-80 transition"
                      >
                        {linkedAccounts?.includes(
                          Number(account?.accountNumber)
                        ) ? (
                          <>
                            <BadgeMinus className="w-4 h-4" /> Remove
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-4 h-4" /> Become Master
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
}
