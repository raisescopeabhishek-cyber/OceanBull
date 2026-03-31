import { BanknoteIcon, ClipboardIcon, EyeIcon, UploadIcon, XIcon, ExternalLinkIcon } from "lucide-react";

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

    // theme helpers
    C,
    rgb,
    rgba,
    inputStyle,
    panelStyle,
    subtleCard,
  } = paymentProps;

  if (!selectedPayment || selectedPayment === "crypto") return null;

  // ✅ normalize backend image path (windows "\" -> "/")
  const normalizedImagePath = paymentImage ? String(paymentImage).replace(/\\/g, "/") : "";
  const fullImageUrl = normalizedImagePath ? `${import.meta.env.VITE_API_BASE_URL}/${normalizedImagePath}` : "";

  // ✅ bank list: if multiple bank transfer methods exist, show all; else show selected one
  const bankList = Array.isArray(bankTransfers) && bankTransfers.length
    ? bankTransfers
    : selectedBankTransfer
      ? [{ bankTransfer: selectedBankTransfer }]
      : selectedMethod?.bankTransfer
        ? [{ bankTransfer: selectedMethod.bankTransfer }]
        : [];

  const isOnlinePayment = selectedPayment === "Online Payment";
  const onlineUrl = typeof paymentDetails === "string" ? paymentDetails.trim() : "";

  return (
    <div className="space-y-6">
      {/* Details block */}
      <div className="p-6 backdrop-blur-xl" style={panelStyle}>
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-xl"
              style={{
                background: `linear-gradient(90deg, ${rgba(C.accent, 0.18)}, ${rgba(C.primary, 0.12)})`,
                border: `1px solid ${rgba(C.border, 0.14)}`,
                color: rgba(C.accentFg || C.fg, 0.9),
              }}
            >
              {selectedPayment === "Bank Transfer" ? <BanknoteIcon size={20} /> : <ClipboardIcon size={20} />}
            </div>
            <h3 className="text-xl font-semibold" style={{ color: rgba(C.fg, 0.95) }}>
              {selectedPayment === "Bank Transfer" ? "Bank Details" : "Payment Details"}
            </h3>
          </div>

          <span
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: `linear-gradient(90deg, ${rgba(C.accent, 0.18)}, ${rgba(C.primary, 0.14)})`,
              color: rgba(C.fg, 0.92),
              border: `1px solid ${rgba(C.accent, 0.22)}`,
            }}
          >
            {selectedPayment}
          </span>
        </div>

        {/* ✅ Bank Transfer render */}
        {selectedPayment === "Bank Transfer" ? (
          bankList?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {bankList.map((b: any, idx: number) => {
                const bt = b?.bankTransfer || {};
                const entries = Object.entries(bt);

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl"
                    style={{
                      background: rgba(C.surface2, 0.12),
                      border: `1px solid ${rgba(C.border, 0.16)}`,
                      boxShadow: `0 18px 40px ${rgba(C.glow, 0.08)}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2" style={{ color: rgba(C.accent, 0.9) }}>
                        <BanknoteIcon size={18} />
                        <div className="font-semibold" style={{ color: rgba(C.fg, 0.92) }}>
                          Bank #{idx + 1}
                        </div>
                      </div>

                      <button
                        onClick={() => copyText(JSON.stringify(bt, null, 2))}
                        className="text-sm font-semibold px-3 py-1.5 rounded-full transition-all"
                        style={{
                          background: rgba(C.accent, 0.14),
                          color: rgba(C.fg, 0.9),
                          border: `1px solid ${rgba(C.accent, 0.22)}`,
                        }}
                      >
                        Copy
                      </button>
                    </div>

                    <div className="space-y-2">
                      {entries.map(([k, v]: any) => (
                        <div key={k} className="flex items-start justify-between gap-4">
                          <div className="text-sm" style={{ color: rgba(C.mutedFg, 0.62) }}>
                            {String(k).replace(/([A-Z])/g, " $1").trim()}
                          </div>
                          <div className="text-sm font-semibold text-right" style={{ color: rgba(C.fg, 0.9) }}>
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
            <div className="p-4 rounded-xl" style={{ ...subtleCard(), color: rgba(C.mutedFg, 0.7) }}>
              No bank transfer details found.
            </div>
          )
        ) : isOnlinePayment ? (
          // ✅ Online payment render
          onlineUrl ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={{ ...subtleCard() }}>
                <div style={{ color: rgba(C.fg, 0.82) }}>{formatTextWithLinks(onlineUrl)}</div>
                <button
                  onClick={() => copyText(onlineUrl)}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: rgba(C.accent, 0.9) }}
                >
                  <ClipboardIcon size={18} />
                  Copy Link
                </button>
              </div>

              <button
                onClick={() => window.open(onlineUrl, "_blank", "noopener,noreferrer")}
                className="w-full py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(90deg, ${rgba(C.accent, 0.95)}, ${rgba(C.primary, 0.95)})`,
                  color: rgb(C.primaryFg),
                  boxShadow: `0 18px 44px ${rgba(C.accent, 0.16)}`,
                }}
              >
                <ExternalLinkIcon size={18} />
                Pay Now
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl" style={{ ...subtleCard(), color: rgba(C.mutedFg, 0.7) }}>
              Online payment link missing.
            </div>
          )
        ) : (
          // ✅ Normal payment details + QR
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={{ ...subtleCard() }}>
                <div className="text-sm leading-relaxed" style={{ color: rgba(C.fg, 0.82) }}>
                  {formatTextWithLinks(paymentDetails)}
                </div>

                {paymentDetails ? (
                  <button
                    onClick={() => copyText(paymentDetails)}
                    className="mt-3 flex items-center gap-2 transition-colors transform hover:scale-[1.02]"
                    style={{ color: rgba(C.accent, 0.9) }}
                  >
                    <ClipboardIcon size={18} />
                    <span className="text-sm font-semibold">Copy Details</span>
                  </button>
                ) : (
                  <div className="mt-2 text-sm" style={{ color: rgba(C.mutedFg, 0.65) }}>
                    No details found for this method.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="p-4 rounded-xl text-center" style={{ ...subtleCard() }}>
                {fullImageUrl ? (
                  <>
                    <img
                      src={fullImageUrl}
                      alt="Payment QR"
                      className="w-48 h-48 object-contain rounded-lg shadow-md mx-auto"
                    />
                    <button
                      onClick={() => window.open(fullImageUrl, "_blank", "noopener,noreferrer")}
                      className="block mt-3 text-sm font-semibold underline"
                      style={{ color: rgba(C.accent, 0.9) }}
                    >
                      View QR
                    </button>
                  </>
                ) : (
                  <>
                    <div
                      className="w-48 h-48 rounded-lg flex items-center justify-center text-6xl"
                      style={{
                        background: `linear-gradient(90deg, ${rgba(C.accent, 0.10)}, ${rgba(C.primary, 0.08)})`,
                        border: `1px solid ${rgba(C.border, 0.14)}`,
                        color: rgba(C.mutedFg, 0.7),
                      }}
                    >
                      📱
                    </div>
                    <p className="text-center mt-2 text-sm font-semibold" style={{ color: rgba(C.accent, 0.85) }}>
                      QR Code
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload + Txn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload */}
        <div className="p-6 backdrop-blur-xl rounded-2xl" style={panelStyle}>
          <h4 className="text-lg font-semibold mb-4" style={{ color: rgba(C.fg, 0.95) }}>
            Upload Proof
          </h4>

          <label
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors group"
            style={{
              borderColor: rgba(C.border, 0.22),
              background: rgba(C.surface2, 0.10),
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLLabelElement).style.borderColor = rgba(C.accent, 0.5))}
            onMouseLeave={(e) => ((e.currentTarget as HTMLLabelElement).style.borderColor = rgba(C.border, 0.22))}
          >
            <div className="group-hover:scale-110 transition-transform" style={{ color: rgba(C.accent, 0.9) }}>
              <UploadIcon />
            </div>
            <span className="text-sm mt-2 transition-colors" style={{ color: rgba(C.mutedFg, 0.7) }}>
              Click to upload image
            </span>

            <input type="file" className="hidden" onChange={handleFileChange} ref={fileInputRef} accept="image/*" />
          </label>

          {file && (
            <div className="mt-4 flex items-center justify-between p-3 rounded-lg" style={{ ...subtleCard() }}>
              <span className="text-sm truncate" style={{ color: rgba(C.fg, 0.85) }}>
                {file.name}
              </span>

              <div className="flex gap-2">
                {previewUrl && (
                  <button onClick={togglePreview} style={{ color: rgba(C.accent, 0.9) }} className="transition-all hover:scale-110">
                    <EyeIcon />
                  </button>
                )}
                <button onClick={handleRemoveFile} style={{ color: rgba(C.danger, 0.9) }} className="transition-all hover:scale-110">
                  <XIcon />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Txn ID */}
        <div className="p-6 backdrop-blur-xl rounded-2xl" style={panelStyle}>
          <h4 className="text-lg font-semibold mb-4" style={{ color: rgba(C.fg, 0.95) }}>
            Transaction ID
          </h4>

          <input
            type="text"
            name="transactionId"
            placeholder="Enter transaction ID"
            value={formData.transactionId}
            onChange={handleInputChange}
            className="w-full px-4 py-3 transition-all"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 4px ${rgba(C.ring, 0.18)}`)}
            onBlur={(e) => (e.currentTarget.style.boxShadow = `0 0 0 0 ${rgba(C.ring, 0)}`)}
          />
        </div>
      </div>
    </div>
  );
}
