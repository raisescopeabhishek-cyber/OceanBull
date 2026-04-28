import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Maximize,
  Minimize,
  Loader,
  CheckCircle2,
  Ban,
  Camera,
  ChevronDown,
  FileCheck2,
  IdCard,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import UseUserHook from "@/hooks/user/UseUserHook";
import toast from "react-hot-toast";
import { getData } from "country-list";
import { userApi } from "@/utils/apiClients";
import { fetchCurrentUser } from "@/redux/AsyncThunk/fetchCurrentUser";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const getTheme = (isDark) => ({
  text: isDark ? "text-white" : "text-slate-900",
  muted: isDark ? "text-white/55" : "text-slate-500",
  softText: isDark ? "text-white/70" : "text-slate-600",

  card: isDark
    ? "border-white/10 bg-white/[0.035]"
    : "border-orange-100 bg-white/70",

  input: isDark
    ? "border-white/10 bg-white/[0.055] text-white placeholder:text-white/35 focus:border-blue-400/50 focus:ring-blue-400/20"
    : "border-orange-300 bg-orange-50/80 text-slate-900 placeholder:text-orange-400 shadow-[0_0_0_3px_rgba(251,146,60,0.08)] focus:border-orange-500 focus:bg-white focus:ring-orange-300/70",

  option: isDark ? "bg-slate-900 text-white" : "bg-orange-50 text-slate-900",

  icon: isDark
    ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
    : "border-orange-200 bg-orange-50 text-orange-600",

  uploadBox: isDark
    ? "border-white/10 bg-white/[0.045] text-white/75 hover:bg-white/[0.07]"
    : "border-orange-300 bg-orange-50/80 text-orange-700 shadow-[0_0_0_3px_rgba(251,146,60,0.08)] hover:bg-white",

  successBadge: isDark
    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
    : "border-emerald-200 bg-emerald-50 text-emerald-700",

  warningBadge: isDark
    ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
    : "border-amber-200 bg-amber-50 text-amber-700",

  dangerBadge: isDark
    ? "border-red-400/20 bg-red-500/10 text-red-300"
    : "border-red-200 bg-red-50 text-red-700",

  button: isDark
    ? "bg-blue-500 text-white hover:bg-blue-400 focus:ring-blue-400/30"
    : "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-300",

  buttonDisabled: isDark
    ? "bg-slate-600 text-white/60"
    : "bg-slate-300 text-slate-600",
});

const DropdownField = ({ theme, label, options, value, onChange }) => (
  <div>
    <label
      className={cx(
        "mb-2 block text-xs font-semibold uppercase tracking-[0.14em]",
        theme.muted
      )}
    >
      {label}
    </label>

    <div className="relative">
      <select
        className={cx(
          "w-full appearance-none rounded-2xl border px-4 py-3 pr-10 text-sm outline-none transition-all duration-200 focus:ring-4",
          theme.input
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option className={theme.option} value="" disabled>
          Select {label}
        </option>

        {options?.map((option, index) => (
          <option className={theme.option} key={index} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500" />
    </div>
  </div>
);

const ImageUploadField = ({ theme, label, onFileChange }) => {
  const fieldNameMap = {
    "Front Side of Document": "frontSideOfDocument",
    "Back Side of Document": "backSideOfDocument",
    "Selfie with Document": "selfieWithDocument",
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      onFileChange(fieldNameMap[label], {
        file,
        preview: reader.result,
        label,
      });
    };

    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label
        className={cx(
          "mb-2 block text-xs font-semibold uppercase tracking-[0.14em]",
          theme.muted
        )}
      >
        {label}
      </label>

      <div className="space-y-2">
        <input
          type="file"
          className="hidden"
          id={`file-${label}`}
          onChange={handleFile}
          accept="image/*"
        />

        <input
          type="file"
          className="hidden"
          id={`camera-${label}`}
          onChange={handleFile}
          accept="image/*"
          capture="environment"
        />

        <label
          htmlFor={`file-${label}`}
          className={cx(
            "flex w-full cursor-pointer items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200",
            theme.uploadBox
          )}
        >
          <Upload className="mr-2 h-4 w-4" />
          Choose File
        </label>

        <label
          htmlFor={`camera-${label}`}
          className={cx(
            "flex w-full cursor-pointer items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 md:hidden",
            theme.uploadBox
          )}
        >
          <Camera className="mr-2 h-4 w-4" />
          Open Camera
        </label>
      </div>
    </div>
  );
};

const ImagePreview = ({ theme, label, preview, onRemove, onFullScreen }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      className={cx("rounded-2xl border p-3", theme.card)}
    >
      <div className="relative overflow-hidden rounded-xl">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        )}

        <img
          src={preview}
          alt={`Preview of ${label}`}
          className={cx(
            "h-52 w-full object-cover transition-all duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />

        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity duration-300 hover:opacity-100">
          <button
            onClick={onFullScreen}
            className="rounded-full bg-white p-2 text-slate-800 hover:bg-slate-100"
            type="button"
          >
            <Maximize size={18} />
          </button>

          <button
            onClick={onRemove}
            className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
            type="button"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <p className={cx("mt-3 text-center text-sm font-semibold", theme.text)}>
        {label}
      </p>
    </motion.div>
  );
};

const FullScreenModal = ({ image, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
  >
    <div className="relative flex h-full w-full items-center justify-center">
      <img
        src={image}
        alt="Full screen preview"
        className="max-h-full max-w-full object-contain"
      />

      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white p-2 text-slate-800 hover:bg-slate-100"
        type="button"
      >
        <Minimize size={24} />
      </button>
    </div>
  </motion.div>
);

const KycStatus = ({ theme, status }) => {
  if (!status) return null;

  if (status === "submitted") {
    return (
      <div
        className={cx(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
          theme.warningBadge
        )}
      >
        <Loader className="h-4 w-4" />
        Under Review
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div
        className={cx(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
          theme.successBadge
        )}
      >
        <CheckCircle2 className="h-4 w-4" />
        Approved
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div
        className={cx(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
          theme.dangerBadge
        )}
      >
        <Ban className="h-4 w-4" />
        Rejected
      </div>
    );
  }

  return null;
};

const UserKycDetails = () => {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";
  const theme = useMemo(() => getTheme(isDark), [isDark]);

  const { getUpdateLoggedUser } = UseUserHook();
  const dispatch = useDispatch();

  const countriesArray = getData();

  const [formData, setFormData] = useState({
    documentType: loggedUser?.kycDetails?.documentType || "",
    countryOfIssue: loggedUser?.kycDetails?.countryOfIssue || "",
    purpose: loggedUser?.kycDetails?.purpose || "",
    occupation: loggedUser?.kycDetails?.occupation || "",
  });

  const [imageFiles, setImageFiles] = useState({
    frontSideOfDocument: null,
    backSideOfDocument: null,
    selfieWithDocument: null,
  });

  const getFullImageUrl = (path) => {
    if (!path) return "";

    return path.startsWith("http")
      ? path
      : `${import.meta.env.VITE_API_BASE_URL}/${path.replace(/\\/g, "/")}`;
  };

  const [imagePreviews, setImagePreviews] = useState({
    "Front Side of Document": "",
    "Back Side of Document": "",
    "Selfie with Document": "",
  });

  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const documentTypes = ["Passport", "Driver's License", "National ID"];
  const countries = countriesArray?.map((value) => value.name);
  const purposes = ["Personal", "Business", "Investment"];
  const occupations = [
    "Employee",
    "Self-Employed",
    "Student",
    "Retired",
    "Unemployed",
  ];

  useEffect(() => {
    setFormData({
      documentType: loggedUser?.kycDetails?.documentType || "",
      countryOfIssue: loggedUser?.kycDetails?.countryOfIssue || "",
      purpose: loggedUser?.kycDetails?.purpose || "",
      occupation: loggedUser?.kycDetails?.occupation || "",
    });

    setImagePreviews({
      "Front Side of Document": getFullImageUrl(
        loggedUser?.kycDetails?.frontSideOfDocument || ""
      ),
      "Back Side of Document": getFullImageUrl(
        loggedUser?.kycDetails?.backSideOfDocument || ""
      ),
      "Selfie with Document": getFullImageUrl(
        loggedUser?.kycDetails?.selfieWithDocument || ""
      ),
    });
  }, [loggedUser]);

  useEffect(() => {
    getUpdateLoggedUser();
  }, []);

  const handleDropdownChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleFileChange = (fieldName, { file, preview, label }) => {
    setImageFiles((prev) => ({
      ...prev,
      [fieldName]: file,
    }));

    setImagePreviews((prev) => ({
      ...prev,
      [label]: preview,
    }));
  };

  const handleRemove = (label) => {
    const fieldNameMap = {
      "Front Side of Document": "frontSideOfDocument",
      "Back Side of Document": "backSideOfDocument",
      "Selfie with Document": "selfieWithDocument",
    };

    setImageFiles((prev) => ({
      ...prev,
      [fieldNameMap[label]]: null,
    }));

    setImagePreviews((prev) => ({
      ...prev,
      [label]: "",
    }));
  };

  const customContent = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>KYC Submitted</title>
  </head>
  <body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background:#f97316;color:#fff;padding:18px;border-radius:10px 10px 0 0;text-align:center;">
        <h2 style="margin:0;">KYC Submitted</h2>
      </div>
      <div style="padding:20px;border:1px solid #fed7aa;">
        <p>Dear ${loggedUser?.firstName || ""} ${loggedUser?.lastName || ""},</p>
        <p>Your KYC has been successfully submitted. We will notify you when it gets verified.</p>
        <p><strong>Username:</strong> ${loggedUser?.email || ""}</p>
        <p><strong>Document Type:</strong> ${formData?.documentType || ""}</p>
        <p><strong>Country of Issue:</strong> ${formData?.countryOfIssue || ""}</p>
        <p><strong>Purpose:</strong> ${formData?.purpose || ""}</p>
        <p><strong>Occupation:</strong> ${formData?.occupation || ""}</p>
        <p>Best regards,<br>${import.meta.env.VITE_WEBSITE_NAME || "Forex"} Team</p>
      </div>
    </div>
  </body>
  </html>`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const toastId = toast.loading("Please wait...");
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      if (imageFiles.frontSideOfDocument) {
        formDataToSend.append(
          "frontSideOfDocument",
          imageFiles.frontSideOfDocument
        );
      }

      if (imageFiles.backSideOfDocument) {
        formDataToSend.append(
          "backSideOfDocument",
          imageFiles.backSideOfDocument
        );
      }

      if (imageFiles.selfieWithDocument) {
        formDataToSend.append(
          "selfieWithDocument",
          imageFiles.selfieWithDocument
        );
      }

      formDataToSend.append("status", "submitted");

      await userApi.put("/kyc-details", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await userApi.post("/custom-mail", {
        email: loggedUser.email,
        content: customContent,
        subject: "KYC Submitted",
      });

      await dispatch(fetchCurrentUser());
      toast.success("KYC details updated", { id: toastId });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cx("rounded-[22px] border p-4 sm:p-5", theme.card)}
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={cx(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
              theme.icon
            )}
          >
            <IdCard className="h-5 w-5" />
          </div>

          <div>
            <h3 className={cx("text-lg font-semibold", theme.text)}>
              KYC Details
            </h3>
            <p className={cx("mt-1 text-sm leading-6", theme.muted)}>
              Submit your identity details and document images for verification.
            </p>
          </div>
        </div>

        <KycStatus theme={theme} status={loggedUser?.kycDetails?.status} />
      </div>

      <div
        className={cx(
          "mb-5 rounded-2xl border px-4 py-3",
          theme.successBadge
        )}
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-sm leading-6">
            Upload clear document images. Blurry or cropped images may delay verification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <DropdownField
          theme={theme}
          label="Purpose"
          options={purposes}
          value={formData.purpose}
          onChange={(value) => handleDropdownChange("purpose", value)}
        />

        <DropdownField
          theme={theme}
          label="Occupation"
          options={occupations}
          value={formData.occupation}
          onChange={(value) => handleDropdownChange("occupation", value)}
        />

        <DropdownField
          theme={theme}
          label="Document Type"
          options={documentTypes}
          value={formData.documentType}
          onChange={(value) => handleDropdownChange("documentType", value)}
        />

        <DropdownField
          theme={theme}
          label="Country of Issue"
          options={countries}
          value={formData.countryOfIssue}
          onChange={(value) => handleDropdownChange("countryOfIssue", value)}
        />
      </div>

      <div className="mt-6">
        <div className="mb-4 flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-orange-500" />
          <p
            className={cx(
              "text-xs font-semibold uppercase tracking-[0.14em]",
              theme.muted
            )}
          >
            Upload Documents
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {Object.keys(imagePreviews).map((label) => (
            <ImageUploadField
              key={label}
              theme={theme}
              label={label}
              onFileChange={handleFileChange}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <AnimatePresence>
          {Object.entries(imagePreviews).map(([label, preview]) =>
            preview ? (
              <ImagePreview
                key={label}
                theme={theme}
                label={label}
                preview={preview}
                onRemove={() => handleRemove(label)}
                onFullScreen={() => setFullScreenImage(preview)}
              />
            ) : null
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex justify-center">
        <motion.button
          type="submit"
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          disabled={isSubmitting}
          className={cx(
            "inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3 text-sm font-bold outline-none transition focus:ring-4 disabled:cursor-not-allowed",
            isSubmitting ? theme.buttonDisabled : theme.button
          )}
        >
          {isSubmitting ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}
          {isSubmitting ? "Updating..." : "Update Details"}
        </motion.button>
      </div>

      <AnimatePresence>
        {fullScreenImage && (
          <FullScreenModal
            image={fullScreenImage}
            onClose={() => setFullScreenImage(null)}
          />
        )}
      </AnimatePresence>
    </form>
  );
};

export default UserKycDetails;