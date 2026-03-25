import { useState } from "react";
import { Lock, AlertTriangle, CheckCircle } from "lucide-react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import ModernHeading from "../lib/ModernHeading";
import { backendApi } from "../../utils/apiClients";



export default function UserResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    return {
      valid:
        pwd.length >= minLength &&
        hasUppercase &&
        hasLowercase &&
        hasNumber &&
        hasSpecialChar,
      errors: {
        length: pwd.length < minLength,
        uppercase: !hasUppercase,
        lowercase: !hasLowercase,
        number: !hasNumber,
        specialChar: !hasSpecialChar,
      },
    };
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();


    if(!token) return setError("Token Missing!")

    console.log("Chala");

    
    setError("");
    setSuccess(false);

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      const errorMessages = [];
      if (passwordValidation.errors.length)
        errorMessages.push("At least 8 characters");
      if (passwordValidation.errors.uppercase)
        errorMessages.push("One uppercase letter");
      if (passwordValidation.errors.lowercase)
        errorMessages.push("One lowercase letter");
      if (passwordValidation.errors.number) errorMessages.push("One number");
      if (passwordValidation.errors.specialChar)
        errorMessages.push("One special character");

      setError(errorMessages.join(", "));
      return;
    }
    const toastId = toast.loading("Please wait..");
    try {
      await backendApi.post(`/auth/reset-password/${token}`, {
        newPassword: confirmPassword,
      });
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
      toast.success("Password Changed successfully", { id: toastId });
      navigate("/user/login");
    } catch (err) {
      console.log(err);
      toast.error(`${err?.response?.data?.message || "something went wrong"}`, {
        id: toastId,
      });
      setError(
        err?.response?.data?.message ||
          "something went wrong, Please try again later !!"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 flex items-center justify-center px-4 py-8">
      <Toaster></Toaster>
      <div className="w-full max-w-md bg-secondary-800 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-8">
        <div className="text-center mb-8">
          <div className=" mb-2">
            <ModernHeading text={"Reset Password"}></ModernHeading>{" "}
          </div>
          <p className="text-gray-300">Enter your new password below</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-500"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            ></button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-500"
            />
          </div>

          {error && (
            <div className="flex items-center text-red-400 bg-red-900/20 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 mr-3" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center text-green-400 bg-green-900/20 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 mr-3" />
              <span>Password successfully reset</span>
              <Link to={"/user/login"}>
                <span className=" mx-2 text-blue-500 underline hover:text-blue-600 transition-all font-semibold">
                  Login
                </span>
              </Link>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-secondary-500-90 hover:bg-secondary-500-80 text-white font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white"
          >
            Reset Password
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Password must contain:
            <ul className="list-disc list-inside mt-2 text-left">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
              <li>One special character</li>
            </ul>
          </p>
        </div>
      </div>
    </div>
  );
}
