import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Maximize,
  Minimize,
  Loader,
  CheckCircle2,
  Ban,
  Camera, // Add Camera icon from lucide-react
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import UseUserHook from "@/hooks/user/UseUserHook";
import toast from "react-hot-toast";
import { getData } from "country-list";
import { userApi } from "@/utils/apiClients";
import { fetchCurrentUser } from "@/redux/AsyncThunk/fetchCurrentUser";

// Dropdown Field Component (unchanged)
const DropdownField = ({ label, options, value, onChange }) => (
  <div className="mb-6 w-full ">
    <label className="block text-sm font-medium text-white mb-2">{label}</label>
    <select
      className="w-full bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950 px-4 py-3 border text-white bg-secondary-900/80 border-gray-700/60 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all duration-300 "
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option className="text-white bg-blue-950" value="" disabled>
        Select {label}
      </option>
      {options?.map((option, index) => (
        <option className="text-white bg-blue-950" key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

// Updated Image Upload Field Component (with Camera Button)
const ImageUploadField = ({ label, onFileChange }) => {
  const fieldNameMap = {
    "Front Side of Document": "frontSideOfDocument",
    "Back Side of Document": "backSideOfDocument",
    "Selfie with Document": "selfieWithDocument",
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onFileChange(fieldNameMap[label], {
          file: file,
          preview: reader.result,
          label: label,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mb-6 w-full">
      <label className="block text-sm font-medium text-white mb-2">
        {label}
      </label>
      <div className="relative flex flex-col gap-2 bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950">
        {/* File Input for Uploading from Device */}
        <input
          type="file"
          className="hidden"
          id={`file-${label}`}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                onFileChange(fieldNameMap[label], {
                  file: file,
                  preview: reader.result,
                  label: label,
                });
              };
              reader.readAsDataURL(file);
            }
          }}
          accept="image/*"
        />

        {/* Camera Input for Capturing from Camera */}
        <input
          type="file"
          className="hidden"
          id={`camera-${label}`}
          onChange={handleCameraCapture}
          accept="image/*"
          capture="environment" // "environment" for back camera, "user" for front camera
        />

        <label
          htmlFor={`file-${label}`}
          className="flex items-center justify-center w-full px-4 py-3 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all duration-300 bg-secondary-900/80 text-gray-100 cursor-pointer hover:bg-secondary-900/60"
        >
          <Upload className="mr-2" size={18} />
          Choose file
        </label>

        {/* Camera Button */}
        <label
          htmlFor={`camera-${label}`}
          className=" md:hidden flex  items-center justify-center w-full px-4 py-3 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all duration-300 bg-secondary-900/80 text-gray-100 cursor-pointer hover:bg-secondary-900/60"
        >
          <Camera className="mr-2" size={18} />
          Open Camera
        </label>

        <input
          className="bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950"
          id={`camera-${label}`}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleCameraCapture}
          style={{ display: "none" }} // hidden input
        />
      </div>
    </div>
  );
};

// Image Preview Component (unchanged)
const ImagePreview = ({ label, preview, onRemove, onFullScreen }) => {
  console.log("label" , label,   "preview" , preview);
  
  const [isLoading, setIsLoading] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative group"
    >
      <div className="w-full aspect-w-3 aspect-h-4 rounded-lg overflow-hidden shadow-lg">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        <img
          src={preview}
          alt={`Preview of ${label}`}
          className={`w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <button
          onClick={onFullScreen}
          className="p-2 bg-white rounded-full text-gray-800 hover:bg-gray-200 transition-colors duration-300 mr-2"
          type="button"
        >
          <Maximize size={20} />
        </button>
        <button
          onClick={onRemove}
          className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors duration-300"
          type="button"
        >
          <X size={20} />
        </button>
      </div>
      <p className="mt-2 text-sm text-white text-center">{label}</p>
    </motion.div>
  );
};

// Full Screen Modal Component (unchanged)
const FullScreenModal = ({ image, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
  >
    <div className="relative w-full h-full flex items-center justify-center">
      <img
        src={image}
        alt="Full screen preview"
        className="max-w-full max-h-full object-contain"
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white rounded-full text-gray-800 hover:bg-gray-200 transition-colors duration-300"
        type="button"
      >
        <Minimize size={24} />
      </button>
    </div>
  </motion.div>
);

// Main Component (unchanged, except for the import of Camera icon)
const UserKycDetails = () => {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const { getUpdateLoggedUser } = UseUserHook();

  const dispatch = useDispatch();

  const countriesArray = getData();

  // Form Data State
  const [formData, setFormData] = useState({
    documentType: loggedUser?.kycDetails?.documentType || "",
    countryOfIssue: loggedUser?.kycDetails?.countryOfIssue || "",
    purpose: loggedUser?.kycDetails?.purpose || "",
    occupation: loggedUser?.kycDetails?.occupation || "",
  });

  // Image States
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

  // Options for dropdown fields -----------------
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

  // Handlers --------------
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Withdrawal Request Confirmation - Arena Trade</title>
    <style>
      body, html {
        margin: 0;
        padding: 0;
        font-family: 'Arial', sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f4f4f4;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 5px;
        background-color: #ffffff;
      }
      .header {
        background-color: #19422df2;
        color: #ffffff;
        padding: 20px 15px;
        text-align: center;
        border-radius: 10px 10px 0 0;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
        letter-spacing: 1px;
      }
      .content {
        padding: 10px 20px;
      }
      .cta-button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #2d6a4f;
        color: #FFFFFF;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        margin: 10px 0;
      }
      .footer {
        background-color: #19422df2;
        color: #ffffff;
        text-align: center;
        padding: 5px 10px;
        font-size: 12px;
        border-radius: 0 0 10px 10px;
      }
      .footer-info {
        margin-top: 6px;
      }
      .footer-info a {
        color: #B6D0E2;
        text-decoration: none;
      }
      
     
      .withdrawal-details {
        background-color: #f8f8f8;
        border-left: 4px solid #2d6a4f;
        padding: 15px;
        margin: 20px 0;
      }
      .withdrawal-details p {
        margin: 5px 0;
      }
      .highlight {
        font-weight: bold;
        color: #0a2342;
      }
      .risk-warning {
        color: #C70039;
        padding: 5px;
        font-size: 12px;
        line-height: 1.4;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Kyc submitted</h1>
      </div>
      <div class="content">
        <p>Dear ${loggedUser?.firstName + " " + loggedUser?.lastName},</p>
<p>Your KYC has been successfully submitted. We will notify you when it gets verified!</p>
        <div class="withdrawal-details">
        <p>Username: <span class="highlight">${loggedUser.email}</span></p>
         <p>Document Type: <span class="highlight">${
           formData?.documentType
         }</span></p>
          <p>Country of issue: <span class="highlight">${
            formData.countryOfIssue
          }</span></p>
          <p>Purpose: <span class="highlight">${formData.purpose}</span></p>
          <p>Occupation: <span class="highlight">${
            formData.occupation
          }</span></p>
        </div>
  
  <p>Thank you for choosing us.</p>
  <p>Happy trading!</p>
        
        <p>Best regards,<br>The ${
          import.meta.env.VITE_WEBSITE_NAME || "Forex"
        } Team</p>
        <hr>
   <div class="risk-warning">
    <strong>Risk Warning:</strong> Trading CFDs carries high risk and may result in losses beyond your initial investment. Trade only with money you can afford to lose and understand the risks.  
    <br><br>
    Our services are not for U.S. citizens or in jurisdictions where they violate local laws.
  </div>
      
  
      </div>
       <div class="footer">
         <div class="footer-info">
                  <p>Website: <a href="https://${
                    import.meta.env.VITE_EMAIL_WEBSITE
                  }"> ${
    import.meta.env.VITE_EMAIL_WEBSITE
  } </a> | E-mail: <a href="mailto:${import.meta.env.VITE_EMAIL_EMAIL || ""}">${
    import.meta.env.VITE_EMAIL_EMAIL || ""
  }</a></p>
  
                  <p>© 2025 ${
                    import.meta.env.VITE_WEBSITE_NAME || ""
                  }. All Rights Reserved</p>
                </div>
        </div>
    </div>
  </body>
  </html>`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Please wait..");

    try {
      const formDataToSend = new FormData();

      // Append form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Append only new files
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

      const res = await userApi.put(
        `/kyc-details`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const customMailRes = await userApi.post(`/custom-mail`, {
        email: loggedUser.email,
        content: customContent,
        subject: "Kyc Submitted",
      });

      // getUpdateLoggedUser();
      await dispatch(fetchCurrentUser());
      toast.success("Details updated", { id: toastId });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!!", { id: toastId });
    }
  };

  useEffect(() => {
    const getFullImageUrl = (path) => {
      if (!path) return "";
      return path.startsWith("http")
        ? path
        : `${import.meta.env.VITE_API_BASE_URL}/${path.replace(
            /\\/g,
            "/"
          )}`;
    };

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

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto p-2 bg-secondary-800/40 rounded-2xl"
    >
      {loggedUser?.kycDetails?.documentType && (
        <div className="flex gap-2 font-semibold pt-5 items-center justify-center">
          <h1 className="text-lg">Status :</h1>
          {loggedUser?.kycDetails.status === "submitted" ? (
            <div className="flex gap-1 bg-yellow-600/10 text-yellow-500 px-5 py-2 rounded-full">
              <Loader />
              <p>Under Review</p>
            </div>
          ) : loggedUser?.kycDetails.status === "approved" ? (
            <div className="flex gap-1 bg-green-600/10 text-green-500 px-5 py-2 rounded-full">
              <CheckCircle2 />
              <p>Approved</p>
            </div>
          ) : loggedUser?.kycDetails.status === "rejected" ? (
            <div className="flex gap-1 bg-red-600/10 text-red-500 px-5 py-2 rounded-full">
              <Ban />
              <p>Rejected</p>
            </div>
          ) : (
            ""
          )}
        </div>
      )}

      <div className="text-white p-6 rounded-xl ">
        {/* Dropdown Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <DropdownField
            label="Purpose"
            options={purposes}
            value={formData.purpose}
            onChange={(value) => handleDropdownChange("purpose", value)}
          />
          <DropdownField
            label="Occupation"
            options={occupations}
            value={formData.occupation}
            onChange={(value) => handleDropdownChange("occupation", value)}
          />
          <DropdownField
            label="Document Type"
            options={documentTypes}
            value={formData.documentType}
            onChange={(value) => handleDropdownChange("documentType", value)}
          />
          <DropdownField
            label="Country of Issue"
            options={countries}
            value={formData.countryOfIssue}
            onChange={(value) => handleDropdownChange("countryOfIssue", value)}
          />
        </div>

        {/* Image Upload Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          {Object.keys(imagePreviews).map((label) => (
            <ImageUploadField
              key={label}
              label={label}
              onFileChange={handleFileChange}
            />
          ))}
        </div>

        {/* Image Previews */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          <AnimatePresence>
            {Object.entries(imagePreviews).map(([label, preview]) =>
              preview ? (
                <ImagePreview
                  key={label}
                  label={label}
                  preview={preview}
                  onRemove={() => handleRemove(label)}
                  onFullScreen={() => setFullScreenImage(preview)}
                />
              ) : null
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-center mt-8">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-br from-indigo-950  via-blue-700 to-indigo-950 text-white font-semibold rounded-full hover:bg-secondary-500-80 hover:px-8 transition-all shadow-lg"
          >
            Update Details
          </motion.button>
        </div>
      </div>

      {/* Full Screen Modal */}
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
