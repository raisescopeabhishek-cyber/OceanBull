import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { adminLogin } from "../utils/authService"; // ✅ rename loginUser -> adminLogin
import { setAdminUser } from "../../redux/adminSlice";

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.literal("admin").default("admin").optional(),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;

type AdminUser = {
  _id?: string;
  email?: string;
  role?: string;
  [k: string]: any;
};

type LoginResponse = {
  token: string; // ✅ JWT
  userExist?: AdminUser; // (old format)
  user?: AdminUser;      // (new/alternate format)
  message?: string;
  success?: boolean;
};

const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "admin",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    const toastId = toast.loading("Authenticating…");
    try {
      const res = (await adminLogin(values.email, values.password)) as LoginResponse;
      console.log(res);
      

   if (res.redirectTo) window.location.href = res.redirectTo;
    } catch (err: unknown) {
      const message =
        (err as any)?.message ||
        "Something went wrong. Please check your credentials and try again.";
      toast.error(message, { id: toastId });
      form.setError("root", { type: "server", message });
    } finally {
      setLoading(false);
    }
  };

  return { form, onSubmit, loading };
};

export default useLogin;
