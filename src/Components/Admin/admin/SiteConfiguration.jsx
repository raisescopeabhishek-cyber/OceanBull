import { useState, useEffect } from "react";
import { Pencil, Check, X, Loader2, ExternalLink } from "lucide-react";
import { adminApi } from "@/utils/apiClients";
import { useDispatch } from "react-redux";
import { resetTheme } from "../../redux/user/userSlice";

const SiteConfiguration = () => {
  const [details, setDetails] = useState({
    dollarDepositRate: "",
    dollarWithdrawalRate: "",
    serverName: "",
    themeColor: "#F23645",
    mt5Digit: "",
    websiteName: "",
    logo: "",
    favicon: "",
    tNcLink: "",
    androidDL: "",
    iosDL: "",
    windowsDL: "",
    webLink: "", // New field for Web Link
    inrUi: false, // New boolean field for INR UI
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dispatch = useDispatch();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(`/site-config`);
      const data = res.data.data;
      if (data) {
        setDetails({
          dollarDepositRate: data.dollarDepositRate || "",
          dollarWithdrawalRate: data.dollarWithdrawalRate || "",
          serverName: data.serverName || "",
          themeColor: data.themeColor || "#F23645",
          mt5Digit: data.mt5Digit || "",
          websiteName: data.websiteName || "",
          logo: data.logo || "",
          favicon: data.favicon || "",
          tNcLink: data.tNcLink || "",
          androidDL: data.androidDL || "",
          iosDL: data.iosDL || "",
          windowsDL: data.windowsDL || "",
          webLink: data.webLink || "", // New field
          inrUi: data.inrUi || false, // New boolean field
        });
      }
    } catch (error) {
      console.error("Error fetching site config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDetails({
      ...details,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.put(`/site-config`, details);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating site config:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleResetTheme = async () => {
    dispatch(resetTheme());
    setDetails((prevDetails) => ({
      ...prevDetails,
      themeColor: "#F23645", // Default theme color
    }));
    try {
      await adminApi.put(`/site-config`, { ...details, themeColor: "#F23645" });
    } catch (error) {
      console.error("Error resetting theme:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-gray-900 p-2 md:p-4">
      <div className="w-full mx-auto bg-primary-700/30 shadow-2xl backdrop-blur-xl border border-gray-700/20 rounded-3xl p-6 sm:p-8 overflow-hidden transition-all duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-600/40 pb-5 mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl text-primary-300 font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-300 to-gray-300">
            Site Configuration
          </h2>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-4 py-2 bg-green-600 hover:bg-green-700 rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-green-500/20 ${
                    saving && "opacity-70 cursor-not-allowed"
                  }`}
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">Save</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-red-500/20"
                >
                  <X className="w-5 h-5" />
                  <span className="text-sm font-medium">Cancel</span>
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-blue-500/20"
                >
                  <Pencil className="w-5 h-5" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
                <button
                  onClick={handleResetTheme}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-red-500/20"
                >
                  <X className="w-5 h-5" />
                  <span className="text-sm font-medium">Reset Theme</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-primary-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(details).map(([key, value]) => (
              <div
                key={key}
                className="bg-primary-700/40 p-5 rounded-xl border border-primary-600/50 hover:border-primary-600 transition-all duration-300 hover:shadow-lg hover:shadow-gray-700/20 group"
              >
                <label className="text-xs text-gray-400 font-semibold mb-2 block tracking-wide">
                  {key === "tNcLink"
                    ? "T&C Link"
                    : key === "androidDL"
                    ? "Android Download Link"
                    : key === "iosDL"
                    ? "IOS Download Link"
                    : key === "windowsDL"
                    ? "Windows Download Link"
                    : key === "webLink"
                    ? "Web Link" // New label
                    : key === "inrUi"
                    ? "INR UI" // New label
                    : key.replace(/([A-Z])/g, " $1").trim()}
                </label>
                {key === "themeColor" ? (
                  isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          name="themeColor"
                          value={value}
                          onChange={handleChange}
                          className="w-12 h-12 rounded-lg border-2 border-gray-600/20 cursor-pointer shadow-md hover:scale-105 transition-transform"
                          disabled={saving}
                        />
                        <input
                          name="themeColor"
                          value={value}
                          onChange={handleChange}
                          placeholder="#FF5733"
                          className="w-full bg-primary-800/40 text-white p-2.5 rounded-lg border border-gray-600/20 focus:border-primary-400 outline-none transition-all duration-200"
                          disabled={saving}
                        />
                      </div>
                    </div>
                  ) : (
                    <span
                      className="px-4 py-1.5 rounded-full text-black font-bold inline-block shadow-md"
                      style={{ backgroundColor: value }}
                    >
                      {value}
                    </span>
                  )
                ) : isEditing ? (
                  key === "logo" ||
                  key === "favicon" ||
                  key === "tNcLink" ||
                  key === "androidDL" ||
                  key === "iosDL" ||
                  key === "windowsDL" ||
                  key === "webLink" ? ( // Added webLink to the list
                    <div className="space-y-3">
                      {value && (
                        <div className="flex items-center gap-3">
                          {(key === "logo" || key === "favicon") && (
                            <img
                              src={value}
                              alt={key}
                              className="w-28 h-14 rounded-lg border-2 border-gray-600/40 shadow-md group-hover:scale-105 transition-transform"
                            />
                          )}
                          {(key === "tNcLink" ||
                            key === "androidDL" ||
                            key === "iosDL" ||
                            key === "windowsDL" ||
                            key === "webLink") && ( // Added webLink check
                            <a
                              href={value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View
                            </a>
                          )}
                        </div>
                      )}
                      <input
                        type="text"
                        name={key}
                        value={value}
                        onChange={handleChange}
                        placeholder={
                          key.includes("Link") || key.includes("DL")
                            ? "Enter URL"
                            : "Enter image URL"
                        }
                        className="w-full bg-primary-800/40 text-white p-2.5 rounded-lg border border-gray-600/20 focus:border-primary-400 outline-none transition-all duration-200"
                        disabled={saving}
                      />
                    </div>
                  ) : key === "inrUi" ? ( // New boolean field input
                    <div className="flex items-center space-x-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="inrUi"
                          checked={value}
                          onChange={handleChange}
                          className="sr-only peer"
                          disabled={saving}
                        />
                        <div
                          className={`w-12 h-6 bg-red-500 rounded-full peer peer-checked:bg-green-500 transition-all duration-300 ${
                            saving
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                        >
                          <div
                            className={`absolute w-5 h-5 mt-[2px] bg-white rounded-full shadow-md transition-all duration-300 transform ${
                              value ? "translate-x-6" : "translate-x-1"
                            }`}
                          ></div>
                        </div>
                      </label>
                      <span className="text-gray-300 font-medium">
                        {value ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  ) : (
                    <input
                      name={key}
                      value={value}
                      onChange={handleChange}
                      className="w-full bg-primary-800/40 text-white p-2.5 rounded-lg border border-gray-600/20 focus:border-primary-400 outline-none transition-all duration-200"
                      disabled={saving}
                    />
                  )
                ) : (
                  <div className="text-gray-200">
                    {key === "dollarDepositRate" ||
                    key === "dollarWithdrawalRate" ? (
                      <span className="text-xl font-semibold text-gray-200">
                        ₹ {value}
                      </span>
                    ) : key === "logo" || key === "favicon" ? (
                      value ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={value}
                            alt={key}
                            className="w-28 h-14 rounded-lg border-2 border-gray-600/40 p-[2px] object-contain shadow-md group-hover:scale-105 transition-transform"
                          />
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-sm">
                          No Image
                        </span>
                      )
                    ) : key === "tNcLink" ||
                      key === "androidDL" ||
                      key === "iosDL" ||
                      key === "windowsDL" ||
                      key === "webLink" ? ( // Added webLink to the list
                      value ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 transition-colors truncate max-w-full"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {value}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic text-sm">
                          No Link
                        </span>
                      )
                    ) : key === "inrUi" ? ( // Display for boolean field
                      <span className="text-lg font-semibold">
                        {value ? "Enabled" : "Disabled"}
                      </span>
                    ) : (
                      <span className="text-lg font-semibold break-words">
                        {value || "Not Set"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteConfiguration;
