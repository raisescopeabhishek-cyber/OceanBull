import { useState, useEffect } from "react";
import {
  BadgeCheck,
  LoaderIcon,
  OctagonAlert,
  OctagonX,
  Search,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@headlessui/react";
import { useDispatch } from "react-redux";
import { setLoggedUser } from "@/redux/user/userSlice";
import UseUserHook from "@/hooks/user/UseUserHook";
import toast from "react-hot-toast";
import { RiUserSharedFill } from "react-icons/ri";
import { FaUserEdit } from "react-icons/fa";
import { adminApi } from "@/utils/apiClients";
import {
  CFcalculateTimeSinceJoined,
  CFformatDate,
} from "@/utils/CustomFunctions";

const ManageUsers = () => {
  const { subList } = useParams();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  const dispatch = useDispatch();
  const { getReset } = UseUserHook();

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      let finalRes;

      if (subList === "all-users") {
        const res = await adminApi.get(
          `/get-users?page=${currentPage}&limit=10&search=${searchTerm}`
        );
        finalRes = res.data;
      } else if (subList === "email-verified") {
        const res = await adminApi.get(
          `/get-users?page=${currentPage}&limit=10&search=${searchTerm}&emailVerified=true`
        );
        finalRes = res.data;
      } else if (subList === "email-unverified") {
        const res = await adminApi.get(
          `/get-users?page=${currentPage}&limit=10&search=${searchTerm}&emailVerified=false`
        );
        finalRes = res.data;
      } else if (subList === "kyc-verified") {
        const res = await adminApi.get(
          `/get-users?page=${currentPage}&limit=10&search=${searchTerm}&kycVerified=true`
        );
        finalRes = res.data;
      } else if (subList === "kyc-unverified") {
        const res = await adminApi.get(
          `/get-users?page=${currentPage}&limit=10&search=${searchTerm}&kycVerified=false`
        );
        finalRes = res.data;
      }
      setUsers(finalRes.data);
      setPagination(finalRes.pagination);
      setLoading(false);
    } catch (error) {
      toast.error("Something went wrong");
      console.log("Error fetching users:", error);
      setLoading(false);
    }
  };

  // const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const currentUsers = users;

  const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  const totalPages = Math.ceil(pagination?.totalUsers / 10);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const userRedirectHandler = (user) => {
    getReset();
    dispatch(setLoggedUser(user));
    window.open("/user/dashboard", "_blank");
  };
  // useEffect for searching ----

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // useEffect for fetchUsersData ----

  useEffect(() => {
    fetchUsersData();
  }, [subList, currentPage, debouncedSearch]);

  // useEffect for reset pagination ----

  useEffect(() => {
    setCurrentPage(1);
  }, [subList]);

  return (
    <div className="mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-2 justify-between items-center mb-4">
        <h1 className="text-2xl text-white font-bold">
          {capitalizeFirstLetter(subList || "Manage Users")}
        </h1>
        <div className="flex justify">
          <div className="relative flex justify-end items-end  ">
            <input
              type="text"
              placeholder="Email / Name"
              className="pl-10 pr-4 py-2 bg-neutral-800/60 text-white border-primary-500 border-2 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        </div>
      </div>
      {/* Added max-height and overflow-y-auto to create scrollable container */}
      <div className="overflow-x-auto relative max-h-[70vh] overflow-y-auto custom-scrollbar">
        <table className="w-full whitespace-nowrap shadow-md rounded-lg">
          {/* Add sticky positioning to thead */}
          <thead className="bg-primary-400 text-white sticky top-0">
            <tr>
              <th className="py-3 px-4 text-left">User/Email</th>
              <th className="py-3 px-4 text-center">Country</th>
              <th className="py-3 px-4 text-left">EMAIL</th>
              <th className="py-3 px-4 text-left">KYC </th>
              <th className="py-3 px-4 text-left">Total AC</th>
              <th className="py-3 px-4 pl-10 text-left">Joined At</th>
              <th className="py-3 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="border-none">
                  <div className="text-white py-6 border-none flex justify-center items-center gap-4">
                    <p>Loading...</p>
                    <LoaderIcon className="animate-spin" />
                  </div>
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => (
                <tr
                  key={user?._id}
                  className="border-b  border-gray-400/30 bg-primary-700 hover:bg-primary-700/90 text-white"
                >
                  <td className="py-3 flex items-center gap-2 px-4">
                    {subList === "all-users" && (
                      <Button
                        onClick={() => userRedirectHandler(user)}
                        className="text-blue-500 hover:shadow-lg hover:text-blue-500/80 hover:scale-110 transition-all"
                      >
                        <RiUserSharedFill size={25} />
                      </Button>
                    )}
                    <div>
                      <div className="font-semibold">
                        {user?.firstName + " " + user?.lastName}
                      </div>
                      <Link
                        to={`/admin/user-detail/${user?._id}`}
                        className="text-sm cursor-pointer text-gray-300"
                      >
                        {user?.email}
                      </Link>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-center mx-auto flex flex-col justify-center items-center">
                      {user?.country || (
                        <OctagonAlert className="text-yellow-500"></OctagonAlert>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-center mx-auto flex flex-col justify-center items-center">
                      {user?.emailVerified ? (
                        <BadgeCheck className="text-green-500"></BadgeCheck>
                      ) : (
                        <OctagonX className="text-red-500"></OctagonX>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-center mx-auto flex flex-col justify-center items-center">
                      {user?.kycVerified ? (
                        <BadgeCheck className="text-green-500"></BadgeCheck>
                      ) : (
                        <OctagonX className="text-red-500"></OctagonX>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className=" flex flex-col justify-center items-center">
                      <span className="bg-primary-400/20 whitespace-nowrap text-white px-2 py-1 rounded-full text-sm">
                        {user?.accounts?.length}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div>{CFformatDate(user?.createdAt)}</div>
                    <div className="text-sm text-gray-400">
                      {CFcalculateTimeSinceJoined(user?.createdAt)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/admin/user-detail/${user?._id}`}
                      className="text-blue-500 hover:text-blue-500/80 transition-all hover:scale-110"
                    >
                      <div className="text-center mx-auto flex gap-1 justify-center items-center">
                        <FaUserEdit size={20} />
                        Details
                      </div>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex flex-col items-center space-y-3">
        {/* Pagination Info */}
        <p className="text-gray-300 text-sm">
          <span className="font-semibold text-white">
            {" "}
            {pagination?.totalUsers}
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
    </div>
  );
};

export default ManageUsers;
