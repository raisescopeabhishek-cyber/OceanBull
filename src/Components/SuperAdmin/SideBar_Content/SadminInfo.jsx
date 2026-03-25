import React, { useEffect, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { RiUserSharedFill } from "react-icons/ri";
import { backendApi, superAdminApi } from "@/utils/apiClients";
const SadminAdminInfo = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);

  const hideTimerRef = useRef(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await superAdminApi.get(`/admin/user`);
      setAdmin(data?.data);
    } catch (err) {
      console.error("Error fetching admin details:", err);
      setError("Error: Could not fetch admin details");
      toast.error("Failed to fetch");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await superAdminApi.post(`/admin/create-n-update`, { email, password });
      await fetchDetails();
      setEmail("");
      setPassword("");
      toast.success("Updated Successfully");
    } catch (err) {
      console.error(err);
      setError("Error: Could not create/update admin");
      toast.error("Failed to update");
    }
    setLoading(false);
  };

  const handleShowCredentials = () => {
    if (showCredentials) {
      clearTimeout(hideTimerRef.current);
      setShowCredentials(false);
    } else {
      setShowCredentials(true);
      hideTimerRef.current = setTimeout(() => {
        setShowCredentials(false);
      }, 30000);
    }
  };

const adminLoginHandler = async() => {
  if (!admin) {
    toast.error("Admin not fetched yet! Please try again.");
    return;
  }
 try {
  const res = await superAdminApi.post(
    "/handleAuthentication",
    {
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400, // 302 ko error na banaye
    }
  );

  // If your backend returns JSON like { redirectTo: "..." }
const url = res.data?.redirectTo || res.headers?.location;
  
if (url) {
  window.open(url, "_blank", "noopener,noreferrer");
}
} catch (e) {
  console.log(e);
}


};


  useEffect(() => {
    fetchDetails();
    return () => clearTimeout(hideTimerRef.current);
  }, []);

  return (
    <div className="min-h-screen bg-primary-800 p-6 flex items-center justify-center">
      <Toaster />
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side - Admin Form */}
          <div className="bg-primary-700/60 p-8 rounded-xl shadow-xl w-full">
            <h2 className="text-3xl font-bold text-center text-gray-100 mb-6">
              Admin Management
            </h2>
            <p className="text-center text-sm text-gray-400 mb-6">
              Manage your admin credentials securely. Keep them safe.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-100 mb-2 block"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-4 w-full bg-primary-800/60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-100 mb-2 block"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-4 w-full bg-primary-800/60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-center">{error}</p>}

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-600/80 transition duration-300"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Admin Credentials"}
              </button>
            </form>
          </div>

          {/* Right Side - Credentials Display */}
          <div className="bg-primary-700/60 p-8 rounded-xl shadow-xl w-full max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-100 mb-6">
              Admin Credentials
            </h2>

            {admin ? (
              <div className="space-y-4">
                <button
                  onClick={handleShowCredentials}
                  className="w-full bg-gray-700/40 text-white hover:text-primary-300 py-3 rounded-lg hover:bg-gray-700/30 transition duration-300"
                >
                  {showCredentials ? "Hide Credentials" : "Show Admin Credentials"}
                </button>

                {showCredentials && (
                  <div className="p-6 rounded-lg bg-black/20 backdrop-blur-md transition-all duration-300">
                    <h3 className="text-xl font-semibold text-gray-200 mb-3 flex items-center gap-2">
                      <span>🔐 Admin Details</span>
                    </h3>
                    <p className="text-gray-300">
                      <span className="font-semibold text-gray-100">📧 Email:</span>{" "}
                      {admin.email}
                    </p>
                    <p className="text-gray-300 mt-2">
                      <span className="font-semibold text-gray-100">🔑 Password:</span>{" "}
                      {admin.password}
                    </p>
                    <p className="text-xs text-gray-400 mt-3">🔒 Auto-hides in 30s.</p>
                  </div>
                )}
                <button
                  onClick={adminLoginHandler}
                  className="w-full flex items-center justify-center gap-2 bg-gray-700/40 text-green-400 font-semibold hover:text-green-500 py-3 rounded-lg hover:bg-gray-700/30 transition duration-300"
                >
                  <RiUserSharedFill size={22} />
                  Login as Admin
                </button>
              </div>
            ) : (
              <p className="text-gray-400 text-center">
                No credentials found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SadminAdminInfo;
