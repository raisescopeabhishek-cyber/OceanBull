import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function OtpUi({
  otp,
  setOtp,
  setShowOtpInput,
  verifyOtpHandler,
  apiLoader,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-secondary-900 p-6 rounded-2xl w-[90%] max-w-[340px] shadow-2xl border border-secondary-800/50"
      >
        <h2 className="text-lg font-semibold text-white mb-2 tracking-tight">
          Verify OTP
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          OTP is valid for 5 minutes only
        </p>
        <input
          type="text"
          className="w-full p-3 rounded-lg bg-secondary-800/50 text-white border border-secondary-700/50 focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all placeholder:text-gray-400 text-sm"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={() => {
              setShowOtpInput(false);
              setOtp("");
            }}
            className="px-4 py-2 bg-secondary-800/50 text-gray-300 rounded-full text-sm hover:bg-secondary-800/80 transition-all"
          >
            Cancel
          </button>
          {apiLoader ? (
            <Loader2 className=" animate-spin"></Loader2>
          ) : (
            <button
              onClick={verifyOtpHandler}
              className="px-4 py-2 bg-secondary-500 text-white rounded-full text-sm hover:bg-secondary-400 transition-all font-medium"
            >
              Verify
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
