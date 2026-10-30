import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ModernHeading from "../../lib/ModernHeading";
import UserNewChallengeHook from "../../../hooks/user/UseNewChallengeHook";
import {
  Banknote,
  ClipboardIcon,
  Eye,
  Loader2,
  LoaderPinwheelIcon,
  Upload,
  X,
} from "lucide-react";
import { backendApi } from "@/utils/apiClients";
import { useMt5Account } from "../../../hooks/useMt5Accounts";

export default function UserDeposit() {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const siteConfig = useSelector((store) => store.user.siteConfig);
  const paymentMethods = useSelector((store) => store.user.paymentMethods);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    apiGroup: "",
    depositAmount: "",
    accountNumber: "",
    transactionId: "",
  });
  const [accountType, setAccountType] = useState("");
  const selectedAccountExists = loggedUser?.accounts?.some(
    (item) => String(item.accountNumber) === String(formData.accountNumber)
  );
  const { info: liveAccount, isReady } = useMt5Account(
    selectedAccountExists ? formData.accountNumber : ""
  );
  const balanceReady = isReady(["Equity"]);
  const accountBalance = balanceReady ? liveAccount.Equity : "";
  const balanceLoading = !!formData.accountNumber && !balanceReady;
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const { getPaymentMethod } = UserNewChallengeHook();

  // Effects
  useEffect(() => getPaymentMethod(), []);
  // Filter and deduplicate active payment methods
  const bankTransfers = paymentMethods?.filter(
    (value) => value.status === "active" && value.name === "Bank Transfer"
  );

  let uniqueActiveMethods = [];
  const namesSet = new Set();
  paymentMethods?.forEach((method) => {
    if (method.status === "active" && !namesSet.has(method.name)) {
      namesSet.add(method.name);
      uniqueActiveMethods.push(method);
    }
  });
  uniqueActiveMethods.push({ name: "Crypto", icon: "💳" });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(e.target);

    if (name === "accountType") {
      const selectedConfig = loggedUser.accounts?.find(
        (config) => config.accountType === value
      );
      setFormData((prev) => ({
        ...prev,
        accountType: value,
        apiGroup: selectedConfig?.apiGroup || "",
      }));
    } else {
      const updatedValue =
        name === "phone" ? parseInt(value.replace(/\D/g, ""), 10) || "" : value;
      console.log(updatedValue);
      console.log(name);
      console.log(type);
      console.log(checked);

      // apiGroup: "",
      // depositAmount: "",
      // accountNumber: "",
      // transactionId: "",

      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : updatedValue,
      }));
    }
  };

  // File handlers
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile && selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(selectedFile);
    } else setPreviewUrl(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const togglePreview = () => setShowPreview(!showPreview);

  // Copy text to clipboard
  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format text with URL button
  const formatTextWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) =>
      urlRegex.test(part) ? (
        <button
          key={index}
          onClick={() => window.open(part, "_blank", "noopener,noreferrer")}
          className="bg-primary-soft mx-2 text-text px-6 py-2 rounded-full hover:bg-primary-soft transition duration-200 ml-2"
        >
          Pay Now
        </button>
      ) : (
        <span key={index} className="text-muted">
          {part}
        </span>
      )
    );
  };

  // Credit Card payment
  const handleCreditCardClick = async () => {
    setCreatingLoading(true);
    try {
      if (
        !loggedUser?.email ||
        !formData.depositAmount ||
        !formData.accountNumber
      ) {
        alert("⚠️ Enter all required details.");
        return;
      }
      const res = await fetch(
        "http://localhost:4000/api/auth/paygate/create-wallet",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: formData.depositAmount,
            userId: loggedUser._id,
            mt5Account: formData?.accountNumber,
          }),
        }
      );
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const { payment } = await res.json();


      
      alert(
        `✅ Payment Created!\n\nAmount: ${payment.price_amount} ${
          payment.price_currency
        }\nPay in crypto: ${payment.pay_amount} ${
          payment.pay_currency
        }\nTo address: ${payment.pay_address}\n\n⏳ Expires at: ${new Date(
          payment.expiration_estimate_date
        ).toLocaleString()}\nPayment ID: ${payment.payment_id}`
      );
    } catch (error) {
      console.error("Payment creation failed:", error);
      alert("❌ Could not start payment. Please try again.");
    } finally {
      setCreatingLoading(false);
    }
  };

  // Form submit handler
  const submitHandler = async () => {
    if (!creatingLoading && !isSubmitting) {
      if (selectedPayment === "Crypto") {
        await handleCreditCardClick();
      } else {
        const toastID = toast.loading("Please wait..");
        try {
          setCreatingLoading(true);
          setIsSubmitting(true);

          const formValues = {
            userId: loggedUser._id,
            mt5Account: formData?.accountNumber,
            deposit: formData.depositAmount,
            status: "pending",
            accountType,
            method: selectedPayment,
            transactionId: formData.transactionId,
          };

          const formDataObj = new FormData();
          Object.entries(formValues).forEach(([key, value]) =>
            formDataObj.append(key, value)
          );
          formDataObj.append("depositSS", file);

          await backendApi.post("/deposit", formDataObj, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          toast.success("Submitted successfully", { id: toastID });
          navigate("/user/dashboard");
        } catch (error) {
          console.error(error);
          toast.error("Please try again", { id: toastID });
        } finally {
          setCreatingLoading(false);
          setIsSubmitting(false);
        }
      }
    }
  };

  const paymentDetails = paymentMethods?.find(
    (m) => m.name === selectedPayment
  )?.details;
  const paymentImage = paymentMethods?.find(
    (m) => m.name === selectedPayment
  )?.image;

  return (
    <div className="p-10 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-secondary-800/20 p-5 rounded-card mx-auto"
      >
        <div className="space-y-6 text-text">
          {/* Header */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex justify-between">
              <ModernHeading text={"Deposit Funds"} />
              {siteConfig?.inrUi !== false && (
                <div>
                  <div className="flex whitespace-nowrap gap-3 items-center w-full">
                    <h1 className="sm:text-sm font-semibold text-muted">
                      INR Figure
                    </h1>
                    <p className="bg-secondary-500-10 text-secondary-500 txt px-4 sm:px-5 py-1 font-semibold rounded-full">
                      &#8377;{" "}
                      {formData.depositAmount * siteConfig?.dollarDepositRate}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-center">
                    <p className="text-[12px] mb-2 text-subtle">
                      USD to INR Rate:{" "}
                      <span className="font-medium text-subtle">
                        ₹ {siteConfig?.dollarDepositRate}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Account & Deposit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col items-center md:flex-row mt-10 justify-between gap-10"
          >
            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm font-medium w-full flex justify-between text-muted">
                <p>Select Account</p>
                <div>
                  {balanceLoading ? (
                    <LoaderPinwheelIcon className="animate-spin text-secondary-500" />
                  ) : (
                    balanceReady && (
                      <p className="px-4">
                        Balance:{" "}
                        <span className="bg-secondary-500-10 px-3 py-1 rounded-full text-secondary-500">
                          ${accountBalance}
                        </span>
                      </p>
                    )
                  )}
                </div>
              </label>
              <select
                id="accountNumber"
                name="accountNumber"
                onChange={(e) => {
                  // console.log(e.target.value)
                  // console.log(loggedUser)

                  const selectedValue = loggedUser.accounts?.find(
                    (v) => v.accountNumber == e.target.value
                  );
                  console.log(selectedValue);
                  setAccountType(selectedValue?.accountType || "");
                  handleInputChange(e);
                }}
                className="w-full px-4 py-2 border bg-secondary-800/20 border-line rounded-field focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
              >
                <option className="bg-surface text-text" value="">
                  Select Account
                </option>
                {loggedUser.accounts?.map((value, index) => (
                  <option
                    key={index}
                    className="bg-surface text-text"
                    value={value.accountNumber}
                  >
                    {value.accountNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label
                htmlFor="depositAmount"
                className="text-sm font-medium text-muted"
              >
                Deposit Amount
              </label>
              <input
                type="number"
                id="depositAmount"
                name="depositAmount"
                placeholder="Enter amount"
                onChange={handleInputChange}
                className="w-full px-4 py-2 border bg-secondary-800/20 border-line rounded-field focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
              />
            </div>
          </motion.div>

          {/* Payment Method Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <label className="block mb-2 text-sm font-medium">
              Select Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniqueActiveMethods.map((method, index) => (
                <motion.button
                  key={method.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPayment(method.name)}
                  className={`p-4 flex flex-col items-center font-semibold justify-center rounded-xl transition-colors ${
                    selectedPayment === method.name
                      ? "text-text"
                      : "shadow-sm hover:bg-secondary-700/40"
                  }`}
                >
                  <span className="text-2xl mb-2">{method.icon}</span>
                  <span className="text-sm">{method.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Payment Details Section */}
          <AnimatePresence>
            {selectedPayment && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="bg-secondary-900/60 rounded-card px-4 py-8 flex flex-col items-start space-y-4"
              >
                {paymentDetails && selectedPayment !== "Online Payment" && (
                  <div className="flex flex-col gap-10 md:flex-row w-full justify-between items-center">
                    <div className="items-start w-full md:w-[50%]">
                      <div className="w-full whitespace-nowrap my-2 flex flex-col md:flex-row justify-between items-center">
                        <h3 className="text-sm md:text-lg font-bold text-text">
                          Account Details :
                        </h3>
                        <span className="text-sm md:text-lg text-secondary-500 bg-secondary-500-10 uppercase font-semibold px-3 py-1 rounded-full">
                          {selectedPayment}
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row justify-start items-start gap-2 space-y-2 md:space-y-0 bg-secondary-800/30 p-4 rounded-field">
                        <p className="text-sm text-muted leading-tight w-full break-words">
                          {formatTextWithLinks(paymentDetails)}
                        </p>
                        <button
                          onClick={() => copyText(paymentDetails)}
                          className="flex mb-2 items-center self-end text-primary hover:text-primary focus:outline-none space-x-1 text-xs"
                        >
                          <ClipboardIcon className="h-4 w-4" />
                          <span>{copied ? "Copied!" : "Copy"}</span>
                        </button>
                      </div>
                    </div>

                    {paymentImage && (
                      <div className="w-full md:w-[50%] flex justify-center md:justify-end">
                        <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-36 md:h-36 flex flex-col items-center mx-auto space-y-2">
                          <img
                            src={`${
                              import.meta.env.VITE_BACKEND_BASE_URL
                            }/${paymentImage}`}
                            alt="Payment Receipt"
                            className="w-full h-full object-contain rounded-field"
                          />
                          <a
                            href={`${
                              import.meta.env.VITE_BACKEND_BASE_URL
                            }/${paymentImage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:text-primary"
                          >
                            View QR
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedPayment === "Bank Transfer" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 justify-between w-full gap-6 flex-row">
                    {bankTransfers?.map((value, index) => (
                      <div
                        key={index}
                        className="bg-secondary-800/30 text-text p-6 rounded-card min-w-lg max-w-xl w-full mx-auto"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <Banknote className="text-success" size={30} />
                          <h2 className="text-md sm:text-lg font-semibold">
                            Bank Account #{index + 1}
                          </h2>
                        </div>
                        <div className="space-y-2 whitespace-nowrap text-base sm:text-lg">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <span className="text-muted">Bank Name:</span>
                            <span className="text-md">
                              {value?.bankTransfer?.bankName}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <span className="text-muted">
                              Account Holder:
                            </span>
                            <span className="text-md">
                              {value?.bankTransfer?.accountHolderName}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <span className="text-muted">
                              Account Number:
                            </span>
                            <span className="text-md">
                              {value?.bankTransfer?.accountNumber}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <span className="text-muted">IFSC Code:</span>
                            <span className="text-md">
                              {value?.bankTransfer?.ifscCode}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPayment === "Online Payment" && paymentDetails && (
                  <a
                    href={paymentDetails}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center text-text font-semibold py-2 rounded-field hover:scale-105 transition-all"
                  >
                    Pay Now
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload & Transaction ID */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col md:flex-row items-center gap-6"
          >
            <div className="md:w-fit w-full">
              <label className="block mb-2 text-sm font-medium">
                Upload proof of payment
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <motion.label
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer bg-secondary-500-70 hover:bg-secondary-500-50 transition-colors py-2 px-4 rounded-field flex items-center"
                >
                  <Upload className="mr-2" /> Choose file
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    accept="image/*"
                  />
                </motion.label>
                {file ? (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <span className="text-sm">{file.name}</span>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleRemoveFile}
                      className="text-danger hover:text-danger"
                    >
                      <X size={20} />
                    </motion.button>
                    {previewUrl && (
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePreview}
                        className="text-primary hover:text-primary"
                      >
                        <Eye size={20} />
                      </motion.button>
                    )}
                  </motion.div>
                ) : (
                  <span className="text-sm">No file chosen</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label
                htmlFor="transactionId"
                className="text-sm font-medium text-muted"
              >
                Transaction ID
              </label>
              <input
                type="text"
                id="transactionId"
                name="transactionId"
                placeholder="Enter Transaction ID"
                onChange={handleInputChange}
                className="w-80 px-4 py-2 border bg-secondary-800/20 border-line rounded-field focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
              />
            </div>
          </motion.div>

          {/* Terms & Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex items-center"
          >
            <input
              type="checkbox"
              id="agreeToTerms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="agreeToTerms" className="text-sm">
              I agree to
              <a
                href={siteConfig?.tNcLink}
                target="_blank"
                className="text-primary mx-1 cursor-pointer"
              >
                Terms & Conditions
              </a>
            </label>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={submitHandler}
              disabled={
                !agreeToTerms ||
                creatingLoading ||
                !selectedPayment ||
                isSubmitting
              }
              className={`flex mx-auto justify-center items-center py-3 px-12 hover:px-16 transition-all rounded-full text-text ${
                selectedPayment && agreeToTerms && !isSubmitting
                  ? "hover:bg-secondary-500-80"
                  : "pointer-events-none"
              }`}
            >
              Submit Request
              {(creatingLoading || isSubmitting) && (
                <Loader2 className="animate-spin mx-2" />
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && previewUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-surface bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-secondary-900 p-4 rounded-field max-w-3xl max-h-[90vh] overflow-auto"
              >
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePreview}
                  className="mt-4 bg-danger-soft text-text px-6 py-2 rounded-full hover:bg-danger-soft"
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
