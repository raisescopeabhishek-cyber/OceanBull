import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Mail, XCircle, Loader2 } from "lucide-react";
import { backendApi } from "../../utils/apiClients";
import ModernHeading from "../lib/ModernHeading";

/* -------------------- Crypto-y background bits -------------------- */
const AnimatedGrid = () => (
  <div className="pointer-events-none absolute inset-0 opacity-10">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15, 159, 110,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 159, 110,0.25) 1px, transparent 1px)",
        backgroundSize: "42px 42px",
        maskImage:
          "radial-gradient(ellipse at 50% 30%, black 60%, transparent 85%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at 50% 30%, black 60%, transparent 85%)",
      }}
    />
  </div>
);

const FloatingOrbs = () => (
  <div className="pointer-events-none absolute inset-0">
    {Array.from({ length: 7 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full blur-2xl"
        style={{
          width: 160,
          height: 160,
          left: `${(i * 137) % 100}%`,
          top: `${(i * 79) % 100}%`,
          background:
            i % 3 === 0
              ? "radial-gradient(circle at center, rgba(15, 159, 110,0.25), transparent 60%)"
              : i % 3 === 1
              ? "radial-gradient(circle at center, rgba(34,211,238,0.25), transparent 60%)"
              : "radial-gradient(circle at center, rgba(23, 157, 166,0.25), transparent 60%)",
        }}
        animate={{
          y: [0, i % 2 ? -18 : 18, 0],
          x: [0, i % 2 ? 12 : -12, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 6 + (i % 5),
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.15,
        }}
      />
    ))}
  </div>
);

/* -------------------- Glass card wrapper -------------------- */
const GlassCard = ({ className = "", children }) => (
  <motion.div
    initial={{ opacity: 0, y: 18, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={`relative w-full max-w-xl rounded-2xl border border-success bg-gradient-to-br  via-black/60  backdrop-blur-xl shadow-[0_0_60px_rgba(16,185,129,0.15)] ${className}`}
  >
    <div className="absolute inset-px rounded-[calc(1rem-1px)] pointer-events-none" />
    <div className="relative p-6 sm:p-8">{children}</div>
  </motion.div>
);

/* ============================ Component ============================ */
const UserVerify = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null); // "success" | "error" | null

  // Cooldown for resend UI
  const [cooldownTime, setCooldownTime] = useState(5);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    let timer;
    if (cooldownTime > 0 && isButtonDisabled) {
      timer = setTimeout(() => setCooldownTime((t) => t - 1), 1000);
    } else if (cooldownTime === 0 && isButtonDisabled) {
      setIsButtonDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [cooldownTime, isButtonDisabled]);

  const resendHandler = async () => {
    const toastId = toast.loading("Sending new verification link…");
    try {
     const res =  await backendApi.post(`/send-link?id=${id}`);
     console.log(res);
     
      setCooldownTime(60);
      setIsButtonDisabled(true);
      toast.success(res.data.message, {
        id: toastId,
      });

    } catch (error) {
      console.error("error in fetching/sending user--", error);
      toast.error("Something went wrong. Please try again later.", {
        id: toastId,
      });
    }
  };

  useEffect(() => {
    const verifyEmail = async () => {
      try {
      const res =   await backendApi.post(`/verify-link`, { userId: id, token });
        setVerificationStatus("success");
        // Redirect to login after 5s
        setTimeout(() => navigate(res.data.redirectTo), 5000);
      } catch (error) {
        setVerificationStatus("error");
        console.error("error while verifying--", error);
      } finally {
        setLoading(false);
      }
    };

    if (token !== "000") verifyEmail();
    else setLoading(false);
  }, [id, token, navigate]);

  /* -------------------- Special: token === "000" (initial prompt) -------------------- */
  if (token === "000") {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4 text-text overflow-hidden">
        <AnimatedGrid />
        <FloatingOrbs />
        {/* <Toaster /> */}
        <GlassCard>
          <div className="flex justify-center mb-6">
            <div className="rounded-full p-4 ring-1 ring-success">
              <Mail className="w-10 h-10 text-success" />
            </div>
          </div>

          <div className="mb-6">
            <ModernHeading text="Verify Your Email" />
          </div>

          <p className="text-muted mb-6 text-sm sm:text-base">
            We’ve sent a verification link to your email address. Please check your inbox
            and click the link to activate your account.
          </p>

          <div className="mb-6 rounded-card border border-success bg-success-soft p-4 text-success font-medium">
            <CheckCircle className="inline-block w-5 h-5 mr-2" />
            Link sent successfully!
          </div>

          <div className="space-y-3">
            <motion.button
              onClick={resendHandler}
              disabled={isButtonDisabled}
              whileHover={!isButtonDisabled ? { scale: 1.02 } : {}}
              whileTap={!isButtonDisabled ? { scale: 0.98 } : {}}
              className={`w-full rounded-lg px-4 py-3 font-semibold transition
                ${isButtonDisabled
                  ? "cursor-not-allowed border border-line bg-surface-2 text-subtle"
                  : "border border-success bg-success text-primary-on"}`}
            >
              {isButtonDisabled ? `Resend in ${cooldownTime}s` : "Resend Verification Email"}
            </motion.button>

            <Link to="/user/login" className="block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-field px-4 py-3 font-semibold border border-line bg-surface-2 text-text hover:bg-surface-2"
              >
                Go to Login
              </motion.button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-subtle">
            Didn’t receive the email? Check your spam folder or contact support.
          </p>
        </GlassCard>
      </div>
    );
  }

  /* -------------------- Loading / Success / Error views -------------------- */
  const LoadingView = () => (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative h-16 w-16 mb-4"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-line" />
        <div className="absolute inset-0 rounded-full border-t-2 border-success" />
      </motion.div>
      <h2 className="text-xl sm:text-2xl font-semibold">Verifying your email…</h2>
      <p className="mt-2 text-muted text-sm">This may take a few moments.</p>
    </div>
  );

  const SuccessView = () => (
    <div className="rounded-card border border-success bg-success-soft p-5 sm:p-6 text-success">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <CheckCircle className="h-6 w-6 text-success" />
        </div>
        <div>
          <p className="font-semibold">Success! Your email has been verified.</p>
          <p className="mt-1 text-success text-sm">
            You’ll be redirected to the login page in 5 seconds.
          </p>
          <motion.button
            onClick={() => navigate("/user/login")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 rounded-field bg-success px-4 py-2 font-bold text-text hover:brightness-110"
          >
            Go to Login
          </motion.button>
        </div>
      </div>
    </div>
  );

  const ErrorView = () => (
    <div className="rounded-card border border-danger bg-danger-soft p-5 sm:p-6 text-danger">
      {/* <Toaster /> */}
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <XCircle className="h-6 w-6 text-danger" />
        </div>
        <div>
          <p className="font-semibold">Verification Failed</p>
          <p className="mt-1 text-danger text-sm">
            The verification link may be invalid or expired. Please try again or contact support.
          </p>
          <motion.button
            onClick={resendHandler}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 rounded-field bg-danger px-4 py-2 font-bold text-text hover:brightness-110"
          >
            Resend Verification Email
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 text-text overflow-hidden">
      <AnimatedGrid />
      <FloatingOrbs />

      <GlassCard>
        <div className="mb-6">
          <ModernHeading text="Email Verification" />
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <LoadingView />
            </motion.div>
          )}

          {!loading && verificationStatus === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <SuccessView />
            </motion.div>
          )}

          {!loading && verificationStatus === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <ErrorView />
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
};

export default UserVerify;
