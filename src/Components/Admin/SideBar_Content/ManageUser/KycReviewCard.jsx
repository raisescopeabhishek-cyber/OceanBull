import React from "react";

const KycReviewCard = () => {
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6 space-y-6 border border-gray-200">
      {/* Section: Account Details */}
      <div>
        <h2 className="text-xl font-semibold border-b pb-2 mb-4">Account Details</h2>
        <div className="grid grid-cols-2 gap-y-4">
          <div className="font-medium">KYC Details:</div>
          <div>Verified</div>

          <div className="font-medium">Purpose:</div>
          <div>Personal</div>

          <div className="font-medium">Occupation:</div>
          <div>Software Engineer</div>

          <div className="font-medium">Country of Issue:</div>
          <div>India</div>

          <div className="font-medium">Document Type:</div>
          <div>Passport</div>
        </div>
      </div>

      {/* Section: Document Images */}
      <div>
        <h2 className="text-xl font-semibold border-b pb-2 mb-4">Documents</h2>

        {/* Front Side */}
        <div className="space-y-1">
          <div className="font-medium">Front Side of Document</div>
          <a
            href="/front-document.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Full Image
          </a>
        </div>

        {/* Back Side */}
        <div className="space-y-1 mt-4">
          <div className="font-medium">Back Side of Document</div>
          <a
            href="/back-document.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Full Image
          </a>
        </div>

        {/* Selfie with Document */}
        <div className="space-y-1 mt-4">
          <div className="font-medium">Selfie With Document</div>
          <a
            href="/selfie-document.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Full Image
          </a>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 border-t pt-4">
        <textarea
          placeholder="Add a comment..."
          className="flex-1 border rounded-lg p-2 resize-none"
          rows={2}
        ></textarea>
        <button className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg">
          Close
        </button>
        <button className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg">
          Approve
        </button>
        <button className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg">
          Reject
        </button>
      </div>
    </div>
  );
};

export default KycReviewCard;
