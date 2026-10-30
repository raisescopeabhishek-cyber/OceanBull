import React from "react";

const KycReviewCard = () => {
  return (
    <div className="max-w-3xl mx-auto bg-surface rounded-field p-6 space-y-6 border border-line">
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
            className="text-primary hover:underline"
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
            className="text-primary hover:underline"
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
            className="text-primary hover:underline"
          >
            View Full Image
          </a>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 border-t pt-4">
        <textarea
          placeholder="Add a comment..."
          className="flex-1 border rounded-field p-2 resize-none"
          rows={2}
        ></textarea>
        <button className="px-4 py-2 bg-surface-3 hover:bg-surface-3 rounded-field">
          Close
        </button>
        <button className="px-4 py-2 bg-success text-text hover:bg-success rounded-field">
          Approve
        </button>
        <button className="px-4 py-2 bg-danger text-text hover:bg-danger rounded-field">
          Reject
        </button>
      </div>
    </div>
  );
};

export default KycReviewCard;
