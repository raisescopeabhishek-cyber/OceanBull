import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  BanknoteIcon,
  ClipboardIcon,
  EyeIcon,
  UploadIcon,
  XIcon,
  ExternalLinkIcon,
  QrCodeIcon,
  CheckCircle2,
} from "lucide-react";

export default function SelectedPaymentMethod(paymentProps: any) {
  const {
    selectedPayment,
    selectedMethod,
    paymentDetails,
    paymentImage,
    bankTransfers,
    selectedBankTransfer,

    formatTextWithLinks,
    copyText,

    handleFileChange,
    fileInputRef,
    file,
    togglePreview,
    previewUrl,
    handleInputChange,
    formData,
    handleRemoveFile,

    C,
    rgb,
    rgba,
    inputStyle,
    panelStyle,
    subtleCard,
    isDark,
    textPrimary,
    textSecondary,
    textSoft,

    showPaymentModal,
    setShowPaymentModal,
    setMethodInteractionDone,
    methodInteractionDone,
  } = paymentProps;

  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    if (!showQrModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowQrModal(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showQrModal]);

  useEffect(() => {
    if (!showPaymentModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowPaymentModal(false);
        setMethodInteractionDone?.(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showPaymentModal, setShowPaymentModal, setMethodInteractionDone]);

  if (!selectedPayment || selectedPayment === "crypto") return null;

  const normalizedImagePath = paymentImage
    ? String(paymentImage).replace(/\\/g, "/")
    : "";

  const fullImageUrl = normalizedImagePath
    ? `${import.meta.env.VITE_API_BASE_URL}/${normalizedImagePath}`
    : "";

  const bankList =
    Array.isArray(bankTransfers) && bankTransfers.length
      ? bankTransfers
      : selectedBankTransfer
      ? [{ bankTransfer: selectedBankTransfer }]
      : selectedMethod?.bankTransfer
      ? [{ bankTransfer: selectedMethod.bankTransfer }]
      : [];

  const isOnlinePayment = selectedPayment === "Online Payment";
  const onlineUrl =
    typeof paymentDetails === "string" ? paymentDetails.trim() : "";

  const boxStyle: React.CSSProperties = {
    ...subtleCard(),
    borderRadius: "4px",
  };

  const closeMainModal = () => {
    setShowPaymentModal(false);
    setMethodInteractionDone?.(true);
  };

  const paymentModal =
    typeof document !== "undefined" && showPaymentModal
      ? createPortal(
          <div
            className="fixed inset-0 z-[99998] flex items-center justify-center backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.72)" }}
            onClick={closeMainModal}
          >
            <div
              className="relative h-screen w-screen overflow-auto bg-white p-5 sm:p-6"
              style={{
                borderColor: isDark
                  ? rgba(C.border, 0.14)
                  : "rgba(0,0,0,0.12)",
                borderRadius: "0px",
                boxShadow: "0 30px 80px rgba(0,0,0,0.24)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto w-full max-w-7xl">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3
                      className="text-xl font-semibold sm:text-2xl"
                      style={{ color: textPrimary }}
                    >
                      {selectedPayment === "Bank Transfer"
                        ? "Bank Details"
                        : isOnlinePayment
                        ? "Payment Link"
                        : "Payment Details & QR"}
                    </h3>
                    <p className="mt-1 text-sm" style={{ color: textSecondary }}>
                      Complete your payment here, then close this popup and
                      upload screenshot + transaction ID below.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeMainModal}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all"
                    style={{
                      borderColor: isDark
                        ? "rgba(239,68,68,0.24)"
                        : "rgba(239,68,68,0.18)",
                      background: isDark
                        ? "rgba(239,68,68,0.08)"
                        : "rgba(254,242,242,0.92)",
                      color: isDark
                        ? "rgba(248,113,113,0.95)"
                        : "rgba(220,38,38,0.95)",
                    }}
                  >
                    <XIcon size={18} />
                  </button>
                </div>

                {selectedPayment === "Bank Transfer" ? (
                  bankList?.length ? (
                    <div className="space-y-4">
                      {bankList.map((b: any, idx: number) => {
                        const bt = b?.bankTransfer || {};
                        const entries = Object.entries(bt);

                        return (
                          <div key={idx} className="border p-4" style={boxStyle}>
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <BanknoteIcon
                                  size={18}
                                  style={{ color: rgba(C.accent, 0.95) }}
                                />
                                <div
                                  className="font-semibold"
                                  style={{ color: textPrimary }}
                                >
                                  Bank Account {idx + 1}
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  copyText(JSON.stringify(bt, null, 2))
                                }
                                className="inline-flex items-center gap-1 rounded-sm px-3 py-1.5 text-xs font-semibold"
                                style={{
                                  background: isDark
                                    ? rgba(C.accent, 0.14)
                                    : "rgba(40,116,240,0.08)",
                                  color: textPrimary,
                                  border: `1px solid ${
                                    isDark
                                      ? rgba(C.accent, 0.22)
                                      : "rgba(40,116,240,0.16)"
                                  }`,
                                }}
                              >
                                <ClipboardIcon size={14} />
                                Copy
                              </button>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              {entries.map(([k, v]: any) => (
                                <div
                                  key={k}
                                  className="border px-3 py-3"
                                  style={{
                                    borderColor: isDark
                                      ? rgba(C.border, 0.12)
                                      : "rgba(0,0,0,0.06)",
                                    borderRadius: "4px",
                                    background: isDark
                                      ? "rgba(255,255,255,0.02)"
                                      : "#ffffff",
                                  }}
                                >
                                  <div
                                    className="text-[11px] uppercase tracking-[0.08em]"
                                    style={{ color: textSecondary }}
                                  >
                                    {String(k)
                                      .replace(/([A-Z])/g, " $1")
                                      .trim()}
                                  </div>
                                  <div
                                    className="mt-1 break-words text-sm font-semibold"
                                    style={{ color: textSoft }}
                                  >
                                    {String(v ?? "-")}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      className="border p-4 text-sm"
                      style={{ ...boxStyle, color: textSecondary }}
                    >
                      No bank transfer details found.
                    </div>
                  )
                ) : isOnlinePayment ? (
                  onlineUrl ? (
                    <div className="space-y-4">
                      <div className="border p-4" style={boxStyle}>
                        <div style={{ color: textSoft }}>
                          {formatTextWithLinks(onlineUrl)}
                        </div>

                        <button
                          onClick={() => copyText(onlineUrl)}
                          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold"
                          style={{ color: rgba(C.accent, 0.95) }}
                        >
                          <ClipboardIcon size={18} />
                          Copy Payment Link
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          window.open(
                            onlineUrl,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                        className="flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold"
                        style={{
                          background: "#2874f0",
                          color: "#ffffff",
                          borderRadius: "2px",
                        }}
                      >
                        <ExternalLinkIcon size={18} />
                        Open Payment Link
                      </button>
                    </div>
                  ) : (
                    <div
                      className="border p-4 text-sm"
                      style={{ ...boxStyle, color: textSecondary }}
                    >
                      Online payment link missing.
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div className="border p-4" style={boxStyle}>
                      <div className="mb-3 flex items-center gap-2">
                        <ClipboardIcon
                          size={16}
                          style={{ color: rgba(C.accent, 0.95) }}
                        />
                        <div
                          className="text-sm font-semibold"
                          style={{ color: textPrimary }}
                        >
                          Payment Instructions
                        </div>
                      </div>

                      <div
                        className="text-sm leading-relaxed"
                        style={{ color: textSoft }}
                      >
                        {formatTextWithLinks(paymentDetails)}
                      </div>

                      {paymentDetails ? (
                        <button
                          onClick={() => copyText(paymentDetails)}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
                          style={{ color: rgba(C.accent, 0.95) }}
                        >
                          <ClipboardIcon size={18} />
                          Copy Details
                        </button>
                      ) : (
                        <div
                          className="mt-2 text-sm"
                          style={{ color: textSecondary }}
                        >
                          No details found for this method.
                        </div>
                      )}
                    </div>

                    <div className="border p-4" style={boxStyle}>
                      <div className="mb-3 flex items-center gap-2">
                        <QrCodeIcon
                          size={16}
                          style={{ color: rgba(C.accent, 0.95) }}
                        />
                        <div
                          className="text-sm font-semibold"
                          style={{ color: textPrimary }}
                        >
                          Scan QR
                        </div>
                      </div>

                      <div className="flex justify-center">
                        {fullImageUrl ? (
                          <div className="text-center">
                            <img
                              src={fullImageUrl}
                              alt="Payment QR"
                              className="mx-auto h-48 w-48 rounded object-contain"
                            />

                            <button
                              onClick={() => setShowQrModal(true)}
                              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold underline"
                              style={{ color: rgba(C.accent, 0.95) }}
                            >
                              <EyeIcon size={16} />
                              View Larger QR
                            </button>
                          </div>
                        ) : (
                          <div
                            className="flex h-48 w-48 flex-col items-center justify-center border text-center"
                            style={{
                              borderColor: isDark
                                ? rgba(C.border, 0.14)
                                : "rgba(0,0,0,0.08)",
                              borderRadius: "4px",
                              background: isDark
                                ? "rgba(255,255,255,0.02)"
                                : "#fafafa",
                              color: textSecondary,
                            }}
                          >
                            <QrCodeIcon className="mb-2 h-10 w-10" />
                            <p className="text-sm font-semibold">QR Code</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={closeMainModal}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase"
                    style={{
                      background: "#fb641b",
                      color: "#fff",
                      borderRadius: "2px",
                    }}
                  >
                    Close & Continue
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const qrModal =
    typeof document !== "undefined" && showQrModal && fullImageUrl
      ? createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.75)" }}
            onClick={() => setShowQrModal(false)}
          >
            <div
              className="relative w-full max-w-3xl border bg-white p-5 sm:p-6"
              style={{
                borderColor: isDark
                  ? rgba(C.border, 0.14)
                  : "rgba(0,0,0,0.12)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.16)",
                borderRadius: "6px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3
                    className="text-xl font-semibold sm:text-2xl"
                    style={{ color: textPrimary }}
                  >
                    Payment QR
                  </h3>
                  <p className="mt-1 text-sm" style={{ color: textSecondary }}>
                    Scan this QR to complete your payment.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all"
                  style={{
                    borderColor: isDark
                      ? "rgba(239,68,68,0.24)"
                      : "rgba(239,68,68,0.18)",
                    background: isDark
                      ? "rgba(239,68,68,0.08)"
                      : "rgba(254,242,242,0.92)",
                    color: isDark
                      ? "rgba(248,113,113,0.95)"
                      : "rgba(220,38,38,0.95)",
                  }}
                >
                  <XIcon size={18} />
                </button>
              </div>

              <div
                className="flex justify-center border p-4 sm:p-6"
                style={{
                  ...boxStyle,
                  border: `1px solid ${
                    isDark ? rgba(C.border, 0.14) : "rgba(0,0,0,0.08)"
                  }`,
                }}
              >
                <img
                  src={fullImageUrl}
                  alt="Payment QR Large Preview"
                  className="max-h-[70vh] w-full rounded object-contain"
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => copyText(fullImageUrl)}
                  className="inline-flex flex-1 items-center justify-center gap-2 px-5 py-3 text-sm font-semibold"
                  style={{
                    background: isDark
                      ? rgba(C.accent, 0.14)
                      : "rgba(40,116,240,0.08)",
                    color: textPrimary,
                    border: `1px solid ${
                      isDark
                        ? rgba(C.accent, 0.22)
                        : "rgba(40,116,240,0.16)"
                    }`,
                    borderRadius: "2px",
                  }}
                >
                  <ClipboardIcon size={18} />
                  Copy QR Link
                </button>

                <button
                  type="button"
                  onClick={() =>
                    window.open(fullImageUrl, "_blank", "noopener,noreferrer")
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 px-5 py-3 text-sm font-semibold"
                  style={{
                    background: "#2874f0",
                    color: rgb(C.primaryFg),
                    borderRadius: "2px",
                  }}
                >
                  <ExternalLinkIcon size={18} />
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {methodInteractionDone ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="border p-4" style={{ ...panelStyle, borderRadius: "4px" }}>
            <div className="mb-3 flex items-center gap-2">
              <UploadIcon size={16} style={{ color: rgba(C.accent, 0.95) }} />
              <h4
                className="text-sm font-semibold uppercase tracking-[0.06em]"
                style={{ color: textPrimary }}
              >
                Upload Payment Proof
              </h4>
            </div>

            <label
              className="group flex h-32 w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed transition-colors"
              style={{
                borderColor: isDark
                  ? rgba(C.border, 0.22)
                  : "rgba(0,0,0,0.14)",
                background: isDark ? rgba(C.surface2, 0.1) : "#fafafa",
                borderRadius: "4px",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLLabelElement).style.borderColor =
                  rgba(C.accent, 0.5))
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLLabelElement).style.borderColor = isDark
                  ? rgba(C.border, 0.22)
                  : "rgba(0,0,0,0.14)")
              }
            >
              <div
                className="transition-transform group-hover:scale-110"
                style={{ color: rgba(C.accent, 0.95) }}
              >
                <UploadIcon />
              </div>
              <span
                className="mt-2 text-sm transition-colors"
                style={{ color: textSecondary }}
              >
                Click to upload image
              </span>

              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
                accept="image/*"
              />
            </label>

            {file && (
              <div
                className="mt-4 flex items-center justify-between border p-3"
                style={{ ...boxStyle }}
              >
                <span className="truncate text-sm" style={{ color: textSoft }}>
                  {file.name}
                </span>

                <div className="flex gap-2">
                  {previewUrl && (
                    <button
                      onClick={togglePreview}
                      style={{ color: rgba(C.accent, 0.95) }}
                      className="transition-all hover:scale-110"
                    >
                      <EyeIcon />
                    </button>
                  )}
                  <button
                    onClick={handleRemoveFile}
                    style={{ color: rgba(C.danger, 0.95) }}
                    className="transition-all hover:scale-110"
                  >
                    <XIcon />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="border p-4" style={{ ...panelStyle, borderRadius: "4px" }}>
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} style={{ color: rgba(C.accent, 0.95) }} />
              <h4
                className="text-sm font-semibold uppercase tracking-[0.06em]"
                style={{ color: textPrimary }}
              >
                Transaction ID
              </h4>
            </div>

            <input
              type="text"
              name="transactionId"
              placeholder="Enter transaction ID"
              value={formData.transactionId}
              onChange={handleInputChange}
              className="w-full px-4 py-3 transition-all"
              style={inputStyle}
              onFocus={(e) =>
                (e.currentTarget.style.boxShadow = `0 0 0 3px ${rgba(
                  C.ring,
                  0.12
                )}`)
              }
              onBlur={(e) =>
                (e.currentTarget.style.boxShadow = `0 0 0 0 ${rgba(C.ring, 0)}`)
              }
            />

            <p className="mt-3 text-xs leading-5" style={{ color: textSecondary }}>
              Add UTR / Transaction Reference / Payment ID after completing the
              payment.
            </p>
          </div>
        </div>
      ) : null}

      {paymentModal}
      {qrModal}
    </>
  );
}