import { useEffect, useRef, useState } from "react";

// Mock data to replace Redux store
const mockLoggedUser = {
  _id: "user123",
  email: "user@example.com",
  accounts: [
    { accountNumber: "MT5001234", accountType: "Standard", apiGroup: "API_1" },
    { accountNumber: "MT5005678", accountType: "Pro", apiGroup: "API_2" },
    { accountNumber: "MT5009012", accountType: "VIP", apiGroup: "API_3" },
  ],
};

const mockSiteConfig = {
  inrUi: true,
  dollarDepositRate: 83.25,
  tNcLink: "https://example.com/terms",
};

const mockPaymentMethods = [
  {
    name: "Bank Transfer",
    status: "active",
    icon: "🏦",
    details:
      "Transfer to our bank account. Account: 1234567890, IFSC: BANK001234",
    image: "qr-bank.jpg",
    bankTransfer: {
      bankName: "Example Bank",
      accountHolderName: "Trading Company Ltd",
      accountNumber: "1234567890",
      ifscCode: "BANK001234",
    },
  },
  {
    name: "UPI Payment",
    status: "active",
    icon: "📱",
    details: "Pay using UPI: trading@example.upi or scan QR code",
    image: "qr-upi.jpg",
  },
  {
    name: "Online Payment",
    status: "active",
    icon: "💳",
    details: "https://payment.example.com/pay",
  },
];

// Simple icons as SVG components
const TrendingUpIcon = () => (
  <svg
    className="w-8 h-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 17L17 7M17 7H7M17 7v10"
    />
  </svg>
);

const ActivityIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const WalletIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

const DollarSignIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const UploadIcon = () => (
  <svg
    className="w-8 h-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

const EyeIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const XIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const ClipboardIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const LoaderIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const BitcoinIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16.314 4.365c-.592-2.362-3.69-3.627-6.928-2.829l-1.414-2.829-2.122 1.06 1.414 2.829c-.558.139-1.131.3-1.702.472l-1.424-2.851-2.122 1.06 1.414 2.829c-.463.133-.918.268-1.363.409l-2.464.003 1.06 2.122c.424-.107 1.02-.26 1.728-.26.141 0 .283.009.425.026l1.006 2.016c-.015.004-.036.008-.063.015-.476.119-.952.238-1.427.358l1.06 2.122 2.464-.003c.421-.122.853-.244 1.295-.366l1.424 2.851 2.122-1.06-1.414-2.829c.581-.146 1.176-.293 1.772-.44l1.414 2.829 2.122-1.06-1.424-2.851c3.238-.81 5.51-3.101 4.918-5.463-.478-1.908-1.789-2.939-3.623-3.207.777-.691 1.18-1.65.922-2.746zm-5.93 8.422c-.771.193-3.257.816-3.257.816l-.58-1.161s2.486-.624 3.257-.816c1.543-.387 2.180-1.509 1.424-2.506-.756-.997-2.013-.624-3.257-.236 0 0-2.486.624-2.486.624l-.58-1.161s2.486-.624 2.486-.624c.771-.193 1.388-.544 1.158-1.313-.23-.768-1.004-.544-1.775-.351 0 0-2.486.624-2.486.624l.58 1.161s2.486-.624 3.257-.816c1.312-.329 1.888.351 1.658 1.12-.23.768-.888 1.276-1.888 1.508 1.312.329 2.180 1.276 1.424 2.506-.756 1.23-2.013 1.545-2.836 1.625z" />
  </svg>
);

const BanknoteIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const CreditCardIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

const ZapIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

// Floating particles component
export const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
};

// Animated background grid
export const AnimatedGrid = () => {
  return (
    <div className="absolute inset-0 opacity-10">
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-pulse"
        style={{
          backgroundImage:
            "linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      ></div>
    </div>
  );
};

// Simple toast notification
const showToast = (message, type = "info") => {
  const toast = document.createElement("div");
  toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium transition-all transform translate-x-0 ${
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500"
  }`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transform = "translateX(100%)";
    toast.style.opacity = "0";
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
};

export default function UserDeposit() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    apiGroup: "",
    depositAmount: "",
    accountNumber: "",
    transactionId: "",
  });
  const [accountType, setAccountType] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Simulate fetching account balance
  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (!formData.accountNumber) return;

      setBalanceLoading(true);
      setAccountBalance("");

      // Simulate API call
      setTimeout(() => {
        const mockBalance = (Math.random() * 10000 + 1000).toFixed(2);
        setAccountBalance(mockBalance);
        setBalanceLoading(false);
      }, 1500);
    };

    fetchAccountInfo();
  }, [formData?.accountNumber]);

  // Enhanced payment method icons
  const getPaymentIcon = (name) => {
    switch (name.toLowerCase()) {
      case "crypto":
        return <BitcoinIcon />;
      case "bank transfer":
        return <BanknoteIcon />;
      case "credit card":
        return <CreditCardIcon />;
      case "online payment":
        return <WalletIcon />;
      case "upi payment":
        return <div className="text-2xl">📱</div>;
      default:
        return <DollarSignIcon />;
    }
  };

  const uniqueActiveMethods = [
    ...mockPaymentMethods,
    { name: "Crypto", icon: "💎" },
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "accountType") {
      const selectedConfig = mockLoggedUser.accounts?.find(
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
    showToast("Copied to clipboard!", "success");
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
          className="bg-gradient-to-r from-cyan-500 to-blue-500 mx-2 text-white px-6 py-2 rounded-full hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg transform hover:scale-105"
        >
          <span className="flex items-center gap-2">
            <ZapIcon />
            Pay Now
          </span>
        </button>
      ) : (
        <span key={index} className="text-gray-200">
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
        !mockLoggedUser?.email ||
        !formData.depositAmount ||
        !formData.accountNumber
      ) {
        showToast("⚠️ Enter all required details.", "error");
        return;
      }

      // Simulate payment creation
      setTimeout(() => {
        const mockPayment = {
          id: "pay_" + Math.random().toString(36).substr(2, 9),
          amount: formData.depositAmount,
          status: "pending",
        };
        setPaymentData(mockPayment);
        setShowPaymentModal(true);
        setCreatingLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Payment creation failed:", error);
      showToast("❌ Could not start payment. Please try again.", "error");
      setCreatingLoading(false);
    }
  };

  // Form submit handler
  const submitHandler = async () => {
    if (!creatingLoading && !isSubmitting) {
      if (selectedPayment === "Crypto") {
        await handleCreditCardClick();
      } else {
        try {
          setCreatingLoading(true);
          setIsSubmitting(true);

          // Simulate form submission
          setTimeout(() => {
            showToast("Deposit request submitted successfully!", "success");
            setCreatingLoading(false);
            setIsSubmitting(false);

            // Reset form
            setFormData({
              apiGroup: "",
              depositAmount: "",
              accountNumber: "",
              transactionId: "",
            });
            setSelectedPayment("");
            setAgreeToTerms(false);
            setFile(null);
            setPreviewUrl(null);
          }, 2000);
        } catch (error) {
          console.error(error);
          showToast("Please try again", "error");
          setCreatingLoading(false);
          setIsSubmitting(false);
        }
      }
    }
  };

  const paymentDetails = mockPaymentMethods?.find(
    (m) => m.name === selectedPayment
  )?.details;

  const bankTransfers = mockPaymentMethods?.filter(
    (value) => value.name === "Bank Transfer"
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800
 relative overflow-hidden"
    >
      <FloatingParticles />
      <AnimatedGrid />

      {/* Header with trading stats */}
      <div className="relative z-10 p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4 animate-slide-in-left">
            <div className="p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-cyan-500/30">
              <TrendingUpIcon />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Deposit Funds</h1>
              <p className="text-gray-400">
                Fund your trading account instantly
              </p>
            </div>
          </div>

          <div className="flex gap-4 animate-slide-in-right">
            {mockSiteConfig?.inrUi !== false && (
              <div className="p-4 bg-black/40 backdrop-blur-md rounded-xl border border-cyan-500/30">
                <div className="text-cyan-400 text-sm">INR Amount</div>
                <div className="text-2xl font-bold text-white">
                  ₹{" "}
                  {formData.depositAmount * mockSiteConfig?.dollarDepositRate ||
                    0}
                </div>
                <div className="text-xs text-gray-400">
                  Rate: ₹{mockSiteConfig?.dollarDepositRate}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        {/* Trading dashboard style layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel - Account & Amount */}
          <div className="lg:col-span-1 space-y-6 animate-slide-in-left">
            {/* Account Selection Card */}
            <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <ActivityIcon />
                <h3 className="text-xl font-semibold text-white">
                  Trading Account
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Select Account
                  </label>
                  <div className="relative">
                    <select
                      name="accountNumber"
                      onChange={(e) => {
                        const selectedValue = mockLoggedUser.accounts?.find(
                          (v) => v.accountNumber == e.target.value
                        );
                        setAccountType(selectedValue?.accountType || "");
                        handleInputChange(e);
                      }}
                      className="w-full bg-gray-900/80 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    >
                      <option value="">Choose your account</option>
                      {mockLoggedUser.accounts?.map((account, index) => (
                        <option key={index} value={account.accountNumber}>
                          {account.accountNumber} ({account.accountType})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Balance Display */}
                <div
                  className={`p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30 transition-all duration-500 ${
                    accountBalance
                      ? "opacity-100 transform translate-y-0"
                      : "opacity-0 transform translate-y-2"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 text-sm">
                      Current Balance
                    </span>
                    {balanceLoading ? (
                      <LoaderIcon />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        ${accountBalance}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Deposit Amount Card */}
            <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <WalletIcon />
                <h3 className="text-xl font-semibold text-white">
                  Deposit Amount
                </h3>
              </div>

              <div className="relative">
                <DollarSignIcon />
                <input
                  type="number"
                  name="depositAmount"
                  placeholder="Enter amount"
                  value={formData.depositAmount}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900/80 text-white pl-10 pr-4 py-4 rounded-xl border border-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-lg font-semibold"
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[100, 500, 1000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        depositAmount: amount.toString(),
                      }))
                    }
                    className="py-2 px-3 bg-gray-800 hover:bg-emerald-600/20 text-gray-300 hover:text-emerald-400 rounded-lg transition-all text-sm border border-gray-600 hover:border-emerald-500/50 transform hover:scale-105"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel - Payment Methods & Details */}
          <div className="lg:col-span-2 space-y-6 animate-slide-in-right">
            {/* Payment Methods */}
            <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <ShieldIcon />
                <h3 className="text-xl font-semibold text-white">
                  Payment Methods
                </h3>
                <div className="ml-auto animate-spin-slow">
                  <StarIcon />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {uniqueActiveMethods.map((method, index) => (
                  <div
                    key={method.name}
                    onClick={() => setSelectedPayment(method.name)}
                    className={`p-4 cursor-pointer rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      selectedPayment === method.name
                        ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400 shadow-xl shadow-cyan-500/25 scale-105"
                        : "bg-gray-800/60 border-gray-600 hover:border-gray-500"
                    } border backdrop-blur-sm`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div
                        className={`p-3 rounded-full transition-all ${
                          selectedPayment === method.name
                            ? "bg-cyan-500/20 text-cyan-400"
                            : "bg-gray-700/50 text-gray-400"
                        }`}
                      >
                        {getPaymentIcon(method.name)}
                      </div>
                      <span className="text-sm font-medium text-white">
                        {method.name}
                      </span>
                      {selectedPayment === method.name && (
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            {selectedPayment && (
              <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl animate-slide-in-up">
                {paymentDetails && selectedPayment !== "Online Payment" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">
                        Payment Details
                      </h3>
                      <span className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 rounded-full text-sm font-medium border border-cyan-500/30">
                        {selectedPayment}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-900/60 rounded-xl border border-gray-600">
                          <div className="text-gray-300 text-sm leading-relaxed">
                            {formatTextWithLinks(paymentDetails)}
                          </div>
                          <button
                            onClick={() => copyText(paymentDetails)}
                            className="mt-3 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors transform hover:scale-105"
                          >
                            <ClipboardIcon />
                            <span className="text-sm">
                              {copied ? "Copied!" : "Copy Details"}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <div className="p-4 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 rounded-xl border border-gray-600">
                          <div className="w-48 h-48 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg flex items-center justify-center text-6xl">
                            📱
                          </div>
                          <p className="text-center text-cyan-400 mt-2 text-sm">
                            QR Code Available
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment === "Bank Transfer" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bankTransfers?.map((bank, index) => (
                      <div
                        key={index}
                        className="p-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl border border-emerald-500/30 animate-slide-in-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <BanknoteIcon />
                          <h4 className="text-lg font-semibold text-white">
                            Bank #{index + 1}
                          </h4>
                        </div>

                        <div className="space-y-3 text-sm">
                          {Object.entries(bank.bankTransfer || {}).map(
                            ([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-400 capitalize">
                                  {key.replace(/([A-Z])/g, " $1").trim()}:
                                </span>
                                <span className="text-white font-medium">
                                  {value}
                                </span>
                              </div>
                            )
                          )}
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
                    className="block w-full text-center bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-lg hover:from-green-400 hover:to-green-500 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Pay Now
                  </a>
                )}
              </div>
            )}

            {/* Upload & Transaction */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Upload */}
              <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 backdrop-blur-xl rounded-2xl border border-gray-700/50 animate-slide-in-up">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Upload Proof
                </h4>

                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-cyan-500 transition-colors group">
                  <div className="group-hover:scale-110 transition-transform">
                    <UploadIcon />
                  </div>
                  <span className="text-sm text-gray-400 mt-2 group-hover:text-cyan-400 transition-colors">
                    Click to upload image
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    accept="image/*"
                  />
                </label>

                {file && (
                  <div className="mt-4 flex items-center justify-between p-3 bg-gray-800/60 rounded-lg animate-slide-in-up">
                    <span className="text-sm text-gray-300 truncate">
                      {file.name}
                    </span>
                    <div className="flex gap-2">
                      {previewUrl && (
                        <button
                          onClick={togglePreview}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors transform hover:scale-110"
                        >
                          <EyeIcon />
                        </button>
                      )}
                      <button
                        onClick={handleRemoveFile}
                        className="text-red-400 hover:text-red-300 transition-colors transform hover:scale-110"
                      >
                        <XIcon />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Transaction ID */}
              <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 backdrop-blur-xl rounded-2xl border border-gray-700/50 animate-slide-in-up">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Transaction ID
                </h4>
                <input
                  type="text"
                  name="transactionId"
                  placeholder="Enter transaction ID"
                  value={formData.transactionId}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900/80 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>

            {/* Terms and Submit */}
            <div className="space-y-6">
              <label className="flex items-center gap-3 p-4 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 backdrop-blur-xl rounded-xl border border-gray-700/50 cursor-pointer hover:border-cyan-500/50 transition-all transform hover:scale-[1.02] animate-slide-in-up">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-5 h-5 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                />
                <span className="text-white">
                  I agree to the{" "}
                  <a
                    href={mockSiteConfig?.tNcLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Terms & Conditions
                  </a>
                </span>
              </label>

              <div className="flex justify-center animate-slide-in-up">
                <button
                  onClick={submitHandler}
                  disabled={
                    !agreeToTerms ||
                    creatingLoading ||
                    !selectedPayment ||
                    isSubmitting ||
                    !formData.depositAmount ||
                    !formData.accountNumber
                  }
                  className={`flex items-center justify-center py-4 px-12 rounded-full text-white font-semibold text-lg transition-all transform ${
                    selectedPayment &&
                    agreeToTerms &&
                    formData.depositAmount &&
                    formData.accountNumber &&
                    !isSubmitting
                      ? "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 hover:scale-105 shadow-xl shadow-cyan-500/25"
                      : "bg-gray-600 cursor-not-allowed opacity-50"
                  }`}
                >
                  {(creatingLoading || isSubmitting) && <LoaderIcon />}
                  <span className="ml-2">
                    {selectedPayment === "Crypto"
                      ? "Process Payment"
                      : "Submit Request"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && previewUrl && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 p-6 rounded-2xl max-w-3xl max-h-[90vh] overflow-auto border border-gray-700 animate-scale-in">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-2xl"
              />
              <button
                onClick={togglePreview}
                className="mt-4 w-full bg-red-500/80 text-white px-6 py-3 rounded-full hover:bg-red-600/70 transition-all transform hover:scale-105"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && paymentData && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 p-8 rounded-2xl max-w-md w-full mx-4 border border-gray-700 animate-scale-in">
              <div className="text-center space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="text-3xl">✅</div>
                </div>

                <h3 className="text-2xl font-bold text-white">
                  Payment Initiated
                </h3>

                <div className="space-y-2">
                  <p className="text-gray-300">Payment ID: {paymentData.id}</p>
                  <p className="text-gray-300">Amount: ${paymentData.amount}</p>
                  <p className="text-gray-300">Status: {paymentData.status}</p>
                </div>

                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 rounded-full hover:from-cyan-400 hover:to-purple-500 transition-all transform hover:scale-105"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.5s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
