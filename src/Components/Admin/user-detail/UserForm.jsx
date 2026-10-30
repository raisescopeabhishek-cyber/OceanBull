import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { adminApi } from "../../../utils/apiClients";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  Modal,
  Well,
} from "@/Components/ui";

/**
 * A client's profile, editable in place.
 *
 * The KYC, bank and wallet details were in a modal built on `AlertDialog` —
 * an alert dialog is for a decision, not for reading reference data, and it
 * trapped focus around content a reviewer wants to scroll. They are now a
 * plain modal opened from the profile, with the three groups as sections.
 *
 * Verification toggles stay on the form, because changing them and pressing
 * Save is one action.
 */

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-3 border-b border-line py-1.5 last:border-b-0">
    <span className="lbl shrink-0">{label}</span>
    <span className="numeric min-w-0 truncate text-right text-xs text-text">
      {value || "—"}
    </span>
  </div>
);

const Section = ({ title, children }) => (
  <div>
    <span className="lbl-sm text-text">{title}</span>
    <Well className="mt-1.5 min-w-0">{children}</Well>
  </div>
);

const UserInfoForm = ({ userData }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [verificationStatuses, setVerificationStatuses] = useState({
    email: false,
    kyc: false,
  });

  useEffect(() => {
    if (!userData) return;

    setFormData({
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      phone: userData.phone || "",
      address: userData.address || "",
      city: userData.city || "",
      state: userData.state || "",
      zipCode: userData.zipCode || "",
      country: userData.country || "",
    });

    setVerificationStatuses({
      email: !!userData.emailVerified,
      kyc: !!userData.kycVerified,
    });
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleStatus = (key) => {
    setVerificationStatuses((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    const toastId = toast.loading("Updating user...");
    setSubmitting(true);

    try {
      await adminApi.put(`/update-user`, {
        id: userData?._id,
        ...formData,
        emailVerified: verificationStatuses.email,
        kycVerified: verificationStatuses.kyc,
      });

      toast.success("User updated successfully", { id: toastId });
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const imageCard = (label, path) => {
    if (!path) return null;

    const imageUrl = `${import.meta.env.VITE_API_BASE_URL}/${path}`;

    return (
      <div className="overflow-hidden rounded-field border border-line bg-surface-2">
        <div className="flex items-center justify-between gap-2 border-b border-line px-2.5 py-1.5">
          <span className="lbl-sm text-text">{label}</span>
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="lbl-sm text-primary hover:underline"
          >
            Full size
          </a>
        </div>
        <a href={imageUrl} target="_blank" rel="noreferrer" className="block">
          <img
            src={imageUrl}
            alt={label}
            loading="lazy"
            className="mx-auto max-h-[240px] w-auto object-contain"
          />
        </a>
      </div>
    );
  };

  const text = (name, label, props = {}) => (
    <Field label={label} htmlFor={`uf-${name}`}>
      <Input
        id={`uf-${name}`}
        name={name}
        value={formData[name] ?? ""}
        onChange={handleInputChange}
        placeholder={props.placeholder}
        className={props.numeric ? "numeric" : undefined}
      />
    </Field>
  );

  const hasKyc = !!userData?.kycDetails;
  const hasBank = !!userData?.bankDetails;
  const hasWallet = !!userData?.walletDetails;

  if (!userData) {
    return (
      <EmptyState
        title="No client loaded"
        description="The client record has not finished loading."
      />
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {text("firstName", "First name")}
          {text("lastName", "Last name")}
          {text("email", "Email", { numeric: true })}
          {text("phone", "Phone", { numeric: true })}
          {text("country", "Country")}
          {text("city", "City")}
          {text("state", "State")}
          {text("zipCode", "Zip code", { numeric: true })}
          {text("address", "Address")}
        </div>

        {/* Verification is part of the same save, so it sits with the fields. */}
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <span className="lbl">Verification</span>

          <Button
            type="button"
            size="sm"
            variant={verificationStatuses.email ? "success-soft" : "secondary"}
            onClick={() => toggleStatus("email")}
            aria-pressed={verificationStatuses.email}
          >
            Email {verificationStatuses.email ? "verified" : "unverified"}
          </Button>

          <Button
            type="button"
            size="sm"
            variant={verificationStatuses.kyc ? "success-soft" : "secondary"}
            onClick={() => toggleStatus("kyc")}
            aria-pressed={verificationStatuses.kyc}
          >
            KYC {verificationStatuses.kyc ? "verified" : "unverified"}
          </Button>

          <span className="ml-auto flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDialogOpen(true)}
            >
              KYC &amp; payout details
            </Button>
            <Button type="submit" loading={submitting}>
              Save changes
            </Button>
          </span>
        </div>
      </form>

      <Modal
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="KYC and payout details"
        size="lg"
      >
        <div className="space-y-4">
          {hasKyc ? (
            <>
              <Section title="Declared KYC">
                <DetailRow
                  label="Purpose"
                  value={userData?.kycDetails?.purpose}
                />
                <DetailRow
                  label="Occupation"
                  value={userData?.kycDetails?.occupation}
                />
                <DetailRow
                  label="Country of issue"
                  value={userData?.kycDetails?.countryOfIssue}
                />
                <DetailRow
                  label="Document type"
                  value={userData?.kycDetails?.documentType}
                />
              </Section>

              <div>
                <span className="lbl-sm text-text">Documents</span>
                <div className="mt-1.5 grid gap-3 md:grid-cols-3">
                  {imageCard(
                    "Front of document",
                    userData?.kycDetails?.frontSideOfDocument
                  )}
                  {imageCard(
                    "Back of document",
                    userData?.kycDetails?.backSideOfDocument
                  )}
                  {imageCard(
                    "Selfie with document",
                    userData?.kycDetails?.selfieWithDocument
                  )}
                </div>
              </div>
            </>
          ) : null}

          {hasBank ? (
            <Section title="Bank details">
              <DetailRow
                label="Bank name"
                value={userData?.bankDetails?.bankName}
              />
              <DetailRow
                label="Holder name"
                value={userData?.bankDetails?.holderName}
              />
              <DetailRow
                label="Account number"
                value={userData?.bankDetails?.accountNumber}
              />
              <DetailRow
                label="IFSC code"
                value={userData?.bankDetails?.ifscCode}
              />
              <DetailRow
                label="Swift code"
                value={userData?.bankDetails?.swiftCode}
              />
              <DetailRow label="UPI ID" value={userData?.bankDetails?.upiId} />
            </Section>
          ) : null}

          {hasWallet ? (
            <Section title="Wallet addresses">
              <DetailRow
                label="USDT-TRC20"
                value={userData?.walletDetails?.tetherAddress}
              />
              <DetailRow
                label="USDT-BEP20"
                value={userData?.walletDetails?.ethAddress}
              />
              <DetailRow
                label="Binance ID"
                value={userData?.walletDetails?.accountNumber}
              />
              <DetailRow
                label="BTC address"
                value={userData?.walletDetails?.trxAddress}
              />
            </Section>
          ) : null}

          {!hasKyc && !hasBank && !hasWallet ? (
            <EmptyState
              title="Nothing submitted"
              description="This client has not submitted KYC, bank or wallet details."
            />
          ) : null}

          <div className="flex items-center gap-2">
            <Badge
              tone={userData?.kycVerified ? "success" : "warning"}
              dot={false}
            >
              {userData?.kycVerified ? "KYC verified" : "KYC not verified"}
            </Badge>
            <span className="text-xs text-subtle">
              Change this on the form and press Save.
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserInfoForm;
