import { useEffect, useState } from "react";
import { Ban, CheckCircle, Image, Loader, Search, View } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import toast from "react-hot-toast";
import { backendApi } from "../../../utils/apiClients";
import {
  CFcalculateTimeSinceJoined,
  CFformatDate,
} from "../../../utils/CustomFunctions";
import useAdminCopyRequest from "../../../hooks/admin/UseAdminCopyRequests";

const AdminCopyRequests = () => {
  const [selectedUser, setSelectedUser] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [comment, setComment] = useState("");
  const { data, pagination, refresh } = useAdminCopyRequest({
    page: currentPage,
    limit: 10,
    status: "Pending",
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // on confirm api handler  ------------------------------

  const handleConfirmAction = async (selectedUser, action) => {
    setActionType(action);
    const toastId = toast.loading("Please wait..");
    try {
      const updateRes = await backendApi.put(
        `/update-copy-request/${selectedUser?._id}`,
        {
          status: actionType,
        }
      );
      toast.success(`Request ${actionType}`, { id: toastId });
      refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(
        `${error?.response?.data?.message || "Something went wrong"}`,
        {
          id: toastId,
        }
      );
    } finally {
      setIsDialogOpen(false);
    }
  };

  // pagination -------------------

  const totalPages = pagination.totalPages;
  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  //   toggle handler

  const togglePreview = (item) => {
    setSelectedUser(item);
    setIsDialogOpen(true);
  };

  // page reset ------

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // debouncing searching ------------
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // use effect for data fetching -----------------

  useEffect(() => {
    refresh();
  }, [currentPage, debouncedSearch]);

  useEffect(() => {}, [data]);

  return (
    <div className="mx-auto mt-5 px-5">
      <div className=" w-full flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl flex-col font-bold mb-4 text-white first-letter:uppercase">
          Copy Trading Requests
        </h1>
        {/* <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Name / Email"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-primary-600 border border-primary-500 rounded-lg focus:outline-none focus:border-primary-400 text-white placeholder-primary-300"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-300"
            size={18}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-300 hover:text-white"
            >
              ×
            </button>
          )}
        </div> */}
      </div>

      <div className="overflow-x-auto relative">
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          <table className="min-w-full bg-primary-700">
            {/* Made header sticky */}
            <thead className="bg-primary-400 text-white sticky top-0 z-10">
              <tr>
                <th className="py-2 px-4 text-left">User | Email</th>
                <th className="py-2 px-4 text-left">Accounts Requested</th>
                <th className="py-2 px-4 text-left">Role</th>
                <th className="py-2 px-4 text-left">TimeStamp</th>
                <th className="py-2 px-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody className="text-white">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-4">
                    <div className="text-white flex justify-center items-center gap-4">
                      <p>Loading...</p>
                      <Loader className="animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : (
                data?.map((item) => (
                  <tr key={item._id} className="border-b border-gray-400/30">
                    <td className="py-2 px-4">
                      <div className="font-semibold">
                        {item?.user?.firstName
                          ? item?.user?.firstName
                          : "Not found!!"}
                      </div>
                      <div className="text-white/70 text-sm">
                        {item?.user?.email ? item?.user?.email : "Not found!!"}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        {item.accounts.map((account, index) => (
                          <span
                            key={index}
                            className="bg-gray-500/20 px-2 py-1 rounded-full text-gray-200 text-xs"
                          >
                            {account}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-4 uppercase">
                      <div className="text-white text-sm">{item?.role}</div>
                    </td>

                    <td className="py-3 whitespace-nowrap px-4">
                      <div>{CFformatDate(item?.updatedAt)}</div>
                      <div className="text-sm text-gray-400">
                        {CFcalculateTimeSinceJoined(item?.updatedAt)}
                      </div>
                    </td>

                    <td className="py-2 px-4">
                      <button
                        className="flex items-center justify-center gap-1 text-blue-400 hover:text-blue-500 transition-all"
                        onClick={() => togglePreview(item)}
                      >
                        <View></View> Assign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center space-y-3">
        {/* Pagination Info */}
        <p className="text-gray-300 text-sm">
          <span className="font-semibold text-white">
            {" "}
            {pagination?.totalItems}
          </span>{" "}
          total records
        </p>

        {/* Pagination Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-5 py-2 rounded-xl transition-all ${
              currentPage === 1
                ? "bg-gray-700/40 text-gray-400 cursor-not-allowed"
                : "bg-primary-500 hover:bg-primary-600 text-white shadow-md"
            }`}
          >
            ← Previous
          </button>

          <span className="text-gray-300 text-sm">
            Page <span className="font-semibold text-white">{currentPage}</span>{" "}
            of
            <span className="font-semibold text-white"> {totalPages}</span>
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-5 py-2 rounded-xl transition-all ${
              currentPage === totalPages
                ? "bg-gray-700/40 text-gray-400 cursor-not-allowed"
                : "bg-primary-500 hover:bg-primary-600 text-white shadow-md"
            }`}
          >
            Next →
          </button>
        </div>
      </div>
      <AlertDialog
        className=" w-[300px]"
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Account Details</AlertDialogTitle>
            <AlertDialogDescription>
              <div>
                <div className=" my-4">
                  <h1 className=" text-lg font-bold border-b my-4">
                    Role : {selectedUser?.role}
                  </h1>
                  <div>
                    <p className="">
                      Full name :{" "}
                      <span className=" font-semibold">
                        {" "}
                        {selectedUser?.user?.firstName
                          ? selectedUser?.user?.firstName +
                            selectedUser?.user?.lastName
                          : "Not found!!"}{" "}
                      </span>{" "}
                    </p>
                    <p className="">
                      Email :{" "}
                      <span className=" font-semibold">
                        {" "}
                        {selectedUser?.user?.email
                          ? selectedUser?.user?.email
                          : "Not found!!"}{" "}
                      </span>{" "}
                    </p>
                    <p className="">
                      User total MT5 accounts :{" "}
                      <span className=" font-semibold">
                        {" "}
                        {selectedUser?.accounts?.length}{" "}
                      </span>{" "}
                    </p>
                    <p className="">
                      Requested Accounts:{" "}
                      <span className=" flex gap-3 font-semibold">
                        {" "}
                        {selectedUser?.accounts?.map((value) => (
                          <div className=" flex gap-2" key={value}>
                            {" "}
                            <p>{value}</p>
                          </div>
                        ))}{" "}
                      </span>{" "}
                    </p>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <h1 className=" text-lg font-bold border-b my-4">Action</h1>
            <div className=" flex flex-col gap-4">
              {/* <div>
                <textarea
                  type="text"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className=" text-white bg-black/70 border-gray-300 rounded-lg px-3 py-2 w-full"
                />
              </div> */}
              <div className=" flex gap-4">
                <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
                  Close
                </AlertDialogCancel>
                {/* Approve Button */}
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  onClick={() => handleConfirmAction(selectedUser, "Approved")}
                >
                  Approve
                </button>

                {/* Reject Button */}
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  onClick={() => handleConfirmAction(selectedUser, "Rejected")}
                >
                  Reject
                </button>
              </div>
            </div>

            {/* Comment Input */}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCopyRequests;
