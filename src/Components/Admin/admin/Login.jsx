// import { setAdminUser } from "../../../redux/adminSlice";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { BadgeDollarSign, ScanEyeIcon } from "lucide-react";
// import { backendApi } from "../../../utils/apiClients";
// import md5 from "md5";

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   // browser info--------------

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const submitHandler = async (e) => {
//     e.preventDefault();
//     const toastId = toast.loading("Authenticating...");
//     try {
//       const res = await backendApi.post(`/admin/login`, {
//         email: formData.email,
//         password: formData.password,
//       });
//       if (res.data.status) {
//         toast.success("Login successful", { id: toastId });
//         dispatch(setAdminUser(res.data.userExist));
//         const currentPasswordHash = md5(res.data.userExist.password);
//         localStorage.setItem("admin_password_ref", currentPasswordHash);
//         navigate("/admin/dashboard");
//       } else {
//         toast.error(res.data.msg, { id: toastId });
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Authentication failed", { id: toastId });
//     }
//   };

//   const containerVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.5,
//         when: "beforeChildren",
//         staggerChildren: 0.1,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.5 },
//     },
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.5 }}
//       className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-black to-primary-600/80"
//     >
//       <Toaster />
//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden"
//       >
//         <motion.div
//           variants={itemVariants}
//           className="w-full md:w-1/2 bg-primary-600 text-white flex flex-col justify-center relative overflow-hidden p-12"
//         >
//           <motion.div
//             initial={{ scale: 1.1 }}
//             animate={{ scale: 1 }}
//             transition={{ duration: 0.5 }}
//             className="absolute inset-0 bg-primary-700 opacity-20"
//             style={{
//               backgroundImage: "url('/forex-pattern.svg')",
//               backgroundSize: "cover",
//               backgroundPosition: "center",
//             }}
//           />

//           <div className="relative z-10">
//             <h1 className="text-4xl font-bold mb-4">
//               {import.meta.env.VITE_WEBSITE_NAME || "Forex"} CRM
//             </h1>
//             <p className="text-xl mb-8">Admin Portal</p>
//             <ul className="space-y-2">
//               <li className="flex items-center">
//                 <BadgeDollarSign className="w-6 h-6 mr-2" />
//                 Real-time market data
//               </li>
//               <li className="flex items-center">
//                 <svg
//                   className="w-6 h-6 mr-2"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
//                   ></path>
//                 </svg>
//                 Advanced analytics
//               </li>
//               <li className="flex items-center">
//                 <svg
//                   className="w-6 h-6 mr-2"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//                   ></path>
//                 </svg>
//                 Client management
//               </li>
//             </ul>
//           </div>
//         </motion.div>

//         <div className="w-full md:w-1/2 p-12 bg-gray-50">
//           <motion.div variants={containerVariants} className="max-w-md mx-auto">
//             <motion.div
//               variants={itemVariants}
//               className="flex items-center justify-center mb-8"
//             >
//               <ScanEyeIcon className="w-12 h-12 text-primary-600" />
//             </motion.div>
//             <motion.h2
//               variants={itemVariants}
//               className="text-3xl font-bold text-gray-800 mb-8 text-center"
//             >
//               Admin Login
//             </motion.h2>
//             <form onSubmit={submitHandler} className="space-y-6">
//               <motion.div variants={itemVariants}>
//                 <label
//                   htmlFor="email"
//                   className="block text-sm font-medium text-gray-700"
//                 >
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                   className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-300"
//                 />
//               </motion.div>
//               <motion.div variants={itemVariants}>
//                 <label
//                   htmlFor="password"
//                   className="block text-sm font-medium text-gray-700"
//                 >
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   id="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   required
//                   className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-300"
//                 />
//               </motion.div>
//               <motion.div variants={itemVariants}>
//                 <motion.button
//                   type="submit"
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-300 ease-in-out"
//                 >
//                   Sign in to Dashboard
//                 </motion.button>
//               </motion.div>
//             </form>
//             <motion.p
//               variants={itemVariants}
//               className="mt-8 text-center text-sm text-gray-600"
//             >
//               Need help? Contact{" "}
//               <a
//                 href="#"
//                 className="font-medium text-primary-600 hover:text-primary-500"
//               >
//                 IT support
//               </a>
//             </motion.p>
//           </motion.div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default Login;
