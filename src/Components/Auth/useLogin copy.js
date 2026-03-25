// src/hooks/useLogin.js
import { useState } from "react";
import { loginUser } from "../utils/authService";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { setAdminUser } from "../../redux/adminSlice";
import md5 from "md5";

const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "admin", // default to superadmin
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const toastId = toast.loading("Authenticating...");

      console.log();

      const { email, password } = formData;

      const data = await loginUser(email, password);
      console.log(data);

      toast.success("Login successful", { id: toastId });
      dispatch(setAdminUser(data.userExist));
      const currentPasswordHash = md5(data.userExist.password);
      localStorage.setItem("admin_password_ref", currentPasswordHash);
      navigate("/admin/dashboard");

      // localStorage.setItem("admin_password_ref", data.userExist._id);
      // setMessage("Login successful");

      // window.location.href = "/admin/dashboard"; // update as needed
    } catch (err) {
      setMessage(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    message,
    handleInput,
    handleSubmit,
  };
};

export default useLogin;
