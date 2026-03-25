import { useEffect, useState } from "react";
import { ArrowRight, Check, RefreshCw, X } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { adminApi } from "../../../utils/apiClients";

const UserInfoForm = ({ userData }) => {
  console.log("userData props--", userData);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [verificationStatuses, setVerificationStatuses] = useState({
    email: userData?.emailVerified,
    kyc: userData?.kycVerified,
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
        city: userData.city || "",
        state: userData.state || "",
        zipCode: userData.zipCode || "",
        country: userData.country || "",
      });
      setVerificationStatuses({
        email: userData.emailVerified || false,
        kyc: userData.kycVerified || false,
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleStatus = (key) => {
    setVerificationStatuses((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Plese pait..");

    try {
      const updateLoggedUser = await adminApi.put(`/update-user`, {
        id: userData._id,
        ...formData,
        emailVerified: verificationStatuses.email,
        kycVerified: verificationStatuses.kyc,
      });
      toast.success("User Updated", { id: toastId });
      console.log("update logged user--", updateLoggedUser.data.data);
      // console.log("Form submitted:", { ...formData, ...verificationStatuses });
    } catch (error) {
      console.log("error in updating user--", error);
      toast.error("Updateing Failed", { id: toastId });
    }
  };
  useEffect(() => {
    userData;
  }, []);

  return (
    <div className=" mx-auto p-5 rounded-lg bg-primary-700 shadow-lg text-white">
      <h1 className="text-xl font-bold mb-6">Information of User</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div>
          <label className="block mb-2">First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-primary-600 border border-primary-500"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-primary-600 border border-primary-500"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-primary-600 border border-primary-500"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Mobile Number *</label>
          <div className="flex">
            <select className="p-2 rounded-l bg-primary-600 border border-primary-500">
              <option>+91</option>
            </select>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-2 rounded-r bg-primary-600 border border-l-0 border-primary-500"
              required
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block mb-2">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-primary-600 border border-primary-500"
          />
        </div>
        <div>
          <label className="block mb-2">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-primary-600 border border-primary-500"
          />
        </div>
        <div>
          <label className="block mb-2">State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-primary-600 border border-primary-500"
          />
        </div>
        <div>
          <label className="block mb-2">Zip/Postal</label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-primary-600 border border-primary-500"
          />
        </div>
        <div>
          <label className="block mb-2">Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-primary-600 border border-primary-500"
          />
        </div>
      </form>
      <div className=" flex justify-end">
        <button
          onClick={() => setIsDialogOpen(true)}
          className=" flex justify-end p-4 text-blue-400 hover:underline hover:text-blue-400/80"
        >
          View Account details
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2  max-w-2xl mx-auto gap-4 mt-8">
        <VerificationStatus
          label="Email"
          isVerified={verificationStatuses.email}
          onToggle={() => toggleStatus("email")}
        />
        <VerificationStatus
          label="KYC"
          isVerified={verificationStatuses.kyc}
          onToggle={() => toggleStatus("kyc")}
        />
      </div>

      <button
        type="submit"
        onClick={handleSubmit}
        className="group relative w-full mt-8 p-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg  transition-all duration-300 overflow-hidden"
      >
        <span className="relative z-10 flex items-center justify-center">
          <span className="mr-2 group-hover:mr-4 transition-all duration-300">
            Update
          </span>
          <RefreshCw className="w-5 h-5 animate-spin-slow opacity-0 group-hover:opacity-100 transition-all duration-300" />
        </span>
        <span className="absolute inset-0 w-full h-0 bg-blue-700 group-hover:h-full transition-all duration-300 ease-out"></span>
      </button>

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
                {/* KYC details -- */}
                <div className=" my-4">
                  <h1 className=" text-lg font-bold border-b my-4">
                    KYC Details
                  </h1>
                  <div>
                    <p className="">
                      Purpose -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {userData?.kycDetails?.purpose}{" "}
                      </span>{" "}
                    </p>
                    <p className="">
                      Occupation -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {userData?.kycDetails?.occupation}{" "}
                      </span>{" "}
                    </p>
                    <p className="">
                      Country of issue -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {userData?.kycDetails?.countryOfIssue}{" "}
                      </span>{" "}
                    </p>
                    <p className="">
                      Document Type -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {userData?.kycDetails?.documentType}{" "}
                      </span>{" "}
                    </p>
                    {userData?.kycDetails?.frontSideOfDocument ? (
                      <div className=" border border-1 rounded-md border-gray-500/40 my-4 p-2">
                        <p>Front Side of Docuent </p>
                        <img
                          className=" mx-auto size-[40%]"
                          src={
                            import.meta.env.VITE_API_BASE_URL +
                            "/" +
                            userData?.kycDetails?.frontSideOfDocument
                          }
                          alt=""
                        />
                        <a
                          target="_blank"
                          className=" flex justify-end px-5 text-blue-500 hover:text-blue-600"
                          href={
                            import.meta.env.VITE_API_BASE_URL +
                            "/" +
                            userData?.kycDetails?.frontSideOfDocument
                          }
                        >
                          View Full Image
                        </a>
                      </div>
                    ) : (
                      ""
                    )}
                    {userData?.kycDetails?.backSideOfDocument && (
                      <div className=" border border-1 rounded-md border-gray-500/40 my-4 p-2">
                        <p>Back Side of Document </p>
                        <img
                          className=" mx-auto size-[40%]"
                          src={
                            import.meta.env.VITE_API_BASE_URL +
                            "/" +
                            userData?.kycDetails?.backSideOfDocument
                          }
                          alt=""
                        />
                        <a
                          target="_blank"
                          className=" flex justify-end px-5 text-blue-500 hover:text-blue-600"
                          href={
                            import.meta.env.VITE_API_BASE_URL +
                            "/" +
                            userData?.kycDetails?.backSideOfDocument
                          }
                        >
                          View Full Image
                        </a>
                      </div>
                    )}
                    {userData?.kycDetails?.selfieWithDocument && (
                      <div className=" border border-1 rounded-md border-gray-500/40 my-4 p-2">
                        <p>Selfie With Document </p>
                        <img
                          className=" mx-auto size-[40%]"
                          src={
                            import.meta.env.VITE_API_BASE_URL +
                            "/" +
                            userData?.kycDetails?.selfieWithDocument
                          }
                          alt=""
                        />
                        <a
                          target="_blank"
                          className=" flex justify-end px-5 text-blue-500 hover:text-blue-600"
                          href={
                            import.meta.env.VITE_API_BASE_URL +
                            "/" +
                            userData?.kycDetails?.selfieWithDocument
                          }
                        >
                          View Full Image
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                {/* Bank details -- */}
                <div className="my-4">
                  <h1 className=" text-lg font-bold border-b my-4">
                    Bank Details
                  </h1>
                  <div>
                    <p className="">
                      Bank Name -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {userData?.bankDetails?.bankName}{" "}
                      </span>{" "}
                    </p>
                    <p className="">
                      Holder Name -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {userData?.bankDetails?.holderName}{" "}
                      </span>{" "}
                    </p>
                    <p className="">
                      Account Number -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {userData?.bankDetails?.accountNumber}{" "}
                      </span>{" "}
                    </p>
                    <p className="">
                      IFSC Code -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {userData?.bankDetails?.ifscCode}{" "}
                      </span>{" "}
                    </p>
                    <p className="">
                      Swift Code -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {userData?.bankDetails?.swiftCode}{" "}
                      </span>{" "}
                    </p>
                    <p className="">
                      UPI ID -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {userData?.bankDetails?.upiId}{" "}
                      </span>{" "}
                    </p>
                  </div>
                </div>
                {/* Wallet details -- */}
                <div className="my-4">
                  <h1 className=" text-lg font-bold border-b my-4">
                    Wallet Details
                  </h1>
                  <div>
                    <p className="">
                      USDT-Trc20 -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {userData?.walletDetails?.tetherAddress}{" "}
                      </span>{" "}
                    </p>
                    <p className="">
                      USDT-Bep20 -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {userData?.walletDetails?.ethAddress}{" "}
                      </span>{" "}
                    </p>
                    <p className="">
                      Binance ID -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {userData?.walletDetails?.accountNumber}{" "}
                      </span>{" "}
                    </p>
                    <p className="">
                      BTC Address -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {userData?.walletDetails?.trxAddress}{" "}
                      </span>{" "}
                    </p>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
              Close
            </AlertDialogCancel>

            {/* <AlertDialogAction>Confirm</AlertDialogAction> */}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const VerificationStatus = ({ label, isVerified, onToggle }) => {
  return (
    <div
      className={`p-4 rounded-lg shadow-md transition-all duration-300 ${
        isVerified
          ? "bg-gradient-to-r from-green-400 to-green-600"
          : "bg-gradient-to-r from-red-400 to-red-600"
      } flex items-center justify-between`}
    >
      <span className="text-white font-semibold text-lg">{label}</span>
      <div className="flex items-center space-x-3">
        <span className="text-white font-medium capitalize">
          {isVerified ? "Verified" : "Disabled"}
        </span>
        <div
          className={`p-1 rounded-full ${
            isVerified ? "bg-green-300" : "bg-red-300"
          }`}
        >
          {isVerified ? (
            <Check size={18} className="text-green-700" />
          ) : (
            <X size={18} className="text-red-700" />
          )}
        </div>
        <label className="inline-flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isVerified}
              onChange={onToggle}
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default UserInfoForm;
