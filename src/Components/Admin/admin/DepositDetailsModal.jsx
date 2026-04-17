import { createPortal } from "react-dom";
import {
  ArrowLeftRight,
  Gift,
  Wallet,
  CreditCard,
  User,
  FileText,
  Shield,
  CircleCheckBig,
} from "lucide-react";



const SummaryMiniCard = ({ label, value, helper, isDark, accent = "default" }) => {
  const accentClasses = {
    default: isDark
      ? "border-white/10 bg-white/[0.03]"
      : "border-slate-200 bg-white",
    green: isDark
      ? "border-emerald-500/20 bg-emerald-500/[0.06]"
      : "border-emerald-200 bg-emerald-50/70",
    blue: isDark
      ? "border-blue-500/20 bg-blue-500/[0.06]"
      : "border-blue-200 bg-blue-50/70",
    purple: isDark
      ? "border-purple-500/20 bg-purple-500/[0.06]"
      : "border-purple-200 bg-purple-50/70",
    orange: isDark
      ? "border-orange-500/20 bg-orange-500/[0.06]"
      : "border-orange-200 bg-orange-50/70",
  };

  return (
    <div className={`rounded-2xl border p-4 ${accentClasses[accent]}`}>
      <p
        className={[
          "text-[11px] font-semibold uppercase tracking-[0.14em]",
          isDark ? "text-white/45" : "text-slate-500",
        ].join(" ")}
      >
        {label}
      </p>

      <div
        className={[
          "mt-2 text-base font-bold leading-6 sm:text-lg",
          isDark ? "text-white" : "text-slate-900",
        ].join(" ")}
      >
        {value}
      </div>

      {helper ? (
        <p
          className={[
            "mt-1 text-xs leading-5",
            isDark ? "text-white/50" : "text-slate-500",
          ].join(" ")}
        >
          {helper}
        </p>
      ) : null}
    </div>
  );
};

const DetailStatCard = ({
  title,
  value,
  helper,
  icon,
  tone = "default",
  isDark,
}) => {
  const toneClasses = {
    default: isDark
      ? "border-white/10 bg-white/[0.04]"
      : "border-slate-200 bg-white",
    success: isDark
      ? "border-emerald-500/20 bg-emerald-500/10"
      : "border-emerald-200 bg-emerald-50",
    warning: isDark
      ? "border-yellow-500/20 bg-yellow-500/10"
      : "border-yellow-200 bg-yellow-50",
    info: isDark
      ? "border-blue-500/20 bg-blue-500/10"
      : "border-blue-200 bg-blue-50",
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={[
              "text-[11px] font-semibold uppercase tracking-[0.16em]",
              isDark ? "text-white/45" : "text-slate-500",
            ].join(" ")}
          >
            {title}
          </p>
          <div
            className={[
              "mt-2 text-lg font-bold leading-tight sm:text-xl",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            {value}
          </div>
          {helper ? (
            <p
              className={[
                "mt-1 text-xs",
                isDark ? "text-white/50" : "text-slate-500",
              ].join(" ")}
            >
              {helper}
            </p>
          ) : null}
        </div>

        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            isDark ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700",
          ].join(" ")}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, isDark }) => (
  <div
    className={[
      "flex items-start justify-between gap-4 border-b border-dashed py-3 last:border-b-0",
      isDark ? "border-white/10" : "border-slate-200",
    ].join(" ")}
  >
    <span
      className={[
        "text-sm",
        isDark ? "text-white/55" : "text-slate-500",
      ].join(" ")}
    >
      {label}
    </span>
    <span
      className={[
        "max-w-[55%] text-right text-sm font-semibold break-words",
        isDark ? "text-white" : "text-slate-900",
      ].join(" ")}
    >
      {value}
    </span>
  </div>
);

const DepositDetailsModal = ({
  showDetails,
  setShowDetails,
  selectedDeposit,
  isDark,
  getStatusBadge,
  renderDetailValue,
}) => {
  if (!showDetails) return null;

  const insuranceDetails = selectedDeposit?.insuranceDetails || null;


  const bonusDetails = selectedDeposit?.bonusDetails || null;

const payableAmount = Number(
  selectedDeposit?.finalPayableAmount || selectedDeposit?.deposit || 0
);

const creditedAmount = Number(selectedDeposit?.baseDepositAmount || 0);

const insuranceCharge = Number(
  selectedDeposit?.insuranceDetails?.insuranceChargeAmount || 0
);

const claimAmount = Number(selectedDeposit?.insuranceDetails?.claimAmount || 0);

const isReinsuranceRequest =
  Boolean(selectedDeposit?.insuranceDetails) &&
  payableAmount > 0 &&
  creditedAmount > 0 &&
  payableAmount < creditedAmount;

const requestTypeLabel = isReinsuranceRequest
  ? "Reinsurance Deposit"
  : "Standard Deposit";

const bonusLabel = bonusDetails
  ? `$${Number(bonusDetails?.bonusAmount || 0).toFixed(2)}`
  : "Not Applied";

const insuranceLabel = insuranceDetails
  ? `$${insuranceCharge.toFixed(2)}`
  : "Not Applied";


  

  const getInsuranceStatusBadge = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "claimed") {
      return (
        <span
          className={[
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
            isDark
              ? "bg-blue-500/10 text-blue-300"
              : "bg-blue-50 text-blue-700",
          ].join(" ")}
        >
          <Shield size={14} />
          Claimed
        </span>
      );
    }

    if (normalized === "pending_coverage") {
      return (
        <span
          className={[
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
            isDark
              ? "bg-yellow-500/10 text-yellow-300"
              : "bg-yellow-50 text-yellow-700",
          ].join(" ")}
        >
          <Shield size={14} />
          Pending Coverage
        </span>
      );
    }

    return (
      <span
        className={[
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
          isDark
            ? "bg-emerald-500/10 text-emerald-300"
            : "bg-emerald-50 text-emerald-700",
        ].join(" ")}
      >
        <Shield size={14} />
        Active
      </span>
    );
  };

  const InfoCard = ({
    icon,
    label,
    value,
    subValue,
    iconClass = "",
  }) => (
    <div
      className={[
        "rounded-2xl border p-4",
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-orange-100 bg-orange-50/40",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "flex h-10 w-10 items-center justify-center rounded-xl",
            isDark ? "bg-white/[0.05] text-white" : "bg-white text-slate-700",
            iconClass,
          ].join(" ")}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={[
              "text-[11px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap",
              isDark ? "text-white/45" : "text-slate-500",
            ].join(" ")}
          >
            {label}
          </p>
          <p
            className={[
              "mt-1 text-sm font-semibold leading-6 break-words sm:text-base",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            {value}
          </p>
          {subValue ? (
            <p
              className={[
                "mt-1 text-xs",
                isDark ? "text-white/45" : "text-slate-500",
              ].join(" ")}
            >
              {subValue}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => setShowDetails(false)}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={`relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[28px] p-0 shadow-2xl ${
            isDark
              ? "border border-white/10 bg-[#0b1220] text-white"
              : "border border-orange-200 bg-[#fffaf6] text-slate-900"
          }`}
        >
          <div
            className={`sticky top-0 z-10 border-b px-6 py-5 backdrop-blur-xl ${
              isDark
                ? "border-white/10 bg-[#0b1220]/95"
                : "border-orange-100 bg-[#fffaf6]/95"
            }`}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Deposit Details</h2>
                <p
                  className={`mt-1 text-sm ${
                    isDark ? "text-white/55" : "text-slate-500"
                  }`}
                >
                  Complete deposit, insurance and bonus breakdown for this
                  request.
                </p>
              </div>

              <div className="flex gap-3">
                <div>{renderDetailValue(selectedDeposit?.mt5Account)}</div>

                <div>{getStatusBadge(selectedDeposit?.status)}</div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowDetails(false)}
                    className={`rounded-xl border px-4 py-1 ${
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"
                        : "border-orange-200 bg-white text-slate-700 hover:bg-orange-50"
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DetailStatCard
                title="Deposit Amount"
                value={`$${Number(selectedDeposit?.deposit || 0).toFixed(2)}`}
                icon={<Wallet size={18} />}
                tone="default"
                isDark={isDark}
              />

              <DetailStatCard
                title="Base Amount"
                value={`$${Number(
                  selectedDeposit?.baseDepositAmount || 0
                ).toFixed(2)}`}
                helper={`Type: ${renderDetailValue(selectedDeposit?.accountType)}`}
                icon={<CreditCard size={18} />}
                tone="default"
                isDark={isDark}
              />

              <DetailStatCard
                title="Bonus"
                value={`$${Number(
                  selectedDeposit?.bonusDetails?.bonusAmount || 0
                ).toFixed(2)}`}
                helper={`${Number(
                  selectedDeposit?.bonusDetails?.bonusPercent || 0
                ).toFixed(2)}%`}
                icon={<Gift size={18} />}
                tone="success"
                isDark={isDark}
              />

              <DetailStatCard
                title="Insurance Claim"
                value={`$${Number(
                  selectedDeposit?.insuranceDetails?.claimAmount || 0
                ).toFixed(2)}`}
                helper={
                  insuranceDetails
                    ? `Charge: $${Number(
                        selectedDeposit?.insuranceDetails?.insuranceChargeAmount ||
                          0
                      ).toFixed(2)}`
                    : "No insurance"
                }
                icon={<Shield size={18} />}
                tone="info"
                isDark={isDark}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div
                className={`rounded-[24px] border p-5 ${
                  isDark
                    ? "border-emerald-500/20 bg-emerald-500/[0.05]"
                    : "border-emerald-200 bg-emerald-50/60"
                }`}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Shield
                    size={18}
                    className={isDark ? "text-emerald-300" : "text-emerald-700"}
                  />
                  <h3 className="text-base font-semibold">Insurance Details</h3>
                </div>

                {insuranceDetails ? (
                  <>
                    <DetailRow
                      label="Coverage Status"
                      value={getInsuranceStatusBadge(
                        selectedDeposit?.insuranceDetails?.status
                      )}
                      isDark={isDark}
                    />
                    <DetailRow
                      label="Coverage ID"
                      value={renderDetailValue(
                        selectedDeposit?.insuranceDetails?.coverageId
                      )}
                      isDark={isDark}
                    />
                    <DetailRow
                      label="Insurance Charge"
                      value={`$${Number(
                        selectedDeposit?.insuranceDetails
                          ?.insuranceChargeAmount || 0
                      ).toFixed(2)}`}
                      isDark={isDark}
                    />
                    <DetailRow
                      label="Claim Amount"
                      value={`$${Number(
                        selectedDeposit?.insuranceDetails?.claimAmount || 0
                      ).toFixed(2)}`}
                      isDark={isDark}
                    />
                    <DetailRow
                      label="Claimed At"
                      value={
                        selectedDeposit?.insuranceDetails?.claimedAt
                          ? new Date(
                              selectedDeposit?.insuranceDetails?.claimedAt
                            ).toLocaleString()
                          : "Not claimed yet"
                      }
                      isDark={isDark}
                    />
                    <DetailRow
                      label="Coverage Updated At"
                      value={
                        selectedDeposit?.insuranceDetails?.updatedAt
                          ? new Date(
                              selectedDeposit?.insuranceDetails?.updatedAt
                            ).toLocaleString()
                          : "N/A"
                      }
                      isDark={isDark}
                    />
                  </>
                ) : (
                  <div
                    className={`rounded-2xl border border-dashed p-4 text-sm ${
                      isDark
                        ? "border-white/10 text-white/55"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    No insurance coverage found for this deposit.
                  </div>
                )}
              </div>

              <div
                className={`rounded-[24px] border p-5 ${
                  isDark
                    ? "border-blue-500/20 bg-blue-500/[0.05]"
                    : "border-blue-200 bg-blue-50/60"
                }`}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Gift
                    size={18}
                    className={isDark ? "text-blue-300" : "text-blue-700"}
                  />
                  <h3 className="text-base font-semibold">Bonus Details</h3>
                </div>

                {selectedDeposit?.bonusDetails ? (
                  <>
                    <DetailRow
                      label="Bonus Status"
                      value="Applied"
                      isDark={isDark}
                    />
                    <DetailRow
                      label="Deposit Amount"
                      value={`$${Number(
                        selectedDeposit?.bonusDetails?.depositAmount || 0
                      ).toFixed(2)}`}
                      isDark={isDark}
                    />
                    <DetailRow
                      label="Bonus Percent"
                      value={`${Number(
                        selectedDeposit?.bonusDetails?.bonusPercent || 0
                      ).toFixed(2)}%`}
                      isDark={isDark}
                    />
                    <DetailRow
                      label="Bonus Amount"
                      value={`$${Number(
                        selectedDeposit?.bonusDetails?.bonusAmount || 0
                      ).toFixed(2)}`}
                      isDark={isDark}
                    />
                  </>
                ) : (
                  <div
                    className={`rounded-2xl border border-dashed p-4 text-sm ${
                      isDark
                        ? "border-white/10 text-white/55"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    No bonus details found for this deposit.
                  </div>
                )}
              </div>
            </div>




<div
  className={`rounded-[24px] border p-5 ${
    isDark
      ? "border-purple-500/20 bg-purple-500/[0.05]"
      : "border-purple-200 bg-purple-50/60"
  }`}
>
  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-2">
      <FileText
        size={18}
        className={isDark ? "text-purple-300" : "text-purple-700"}
      />
      <h3 className="text-base font-semibold">Summary Note</h3>
    </div>

    <div className="flex flex-wrap gap-2">
      <span
        className={[
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
          isReinsuranceRequest
            ? isDark
              ? "bg-purple-500/15 text-purple-300"
              : "bg-purple-100 text-purple-700"
            : isDark
            ? "bg-blue-500/15 text-blue-300"
            : "bg-blue-100 text-blue-700",
        ].join(" ")}
      >
        {requestTypeLabel}
      </span>

      {getStatusBadge(selectedDeposit?.status)}
    </div>
  </div>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    <SummaryMiniCard
      label="Account"
      value={renderDetailValue(selectedDeposit?.mt5Account)}
      helper={`Method: ${renderDetailValue(selectedDeposit?.method)}`}
      isDark={isDark}
      accent="purple"
    />

    <SummaryMiniCard
      label="Payable Amount"
      value={`$${payableAmount.toFixed(2)}`}
      helper="User payable amount"
      isDark={isDark}
      accent="orange"
    />

    <SummaryMiniCard
      label="Credited Amount"
      value={`$${creditedAmount.toFixed(2)}`}
      helper="MT5 credited/base amount"
      isDark={isDark}
      accent="blue"
    />

    <SummaryMiniCard
      label="Insurance"
      value={insuranceLabel}
      helper={
        insuranceDetails
          ? `Claim Amount: $${claimAmount.toFixed(2)}`
          : "Insurance not applied"
      }
      isDark={isDark}
      accent="green"
    />

    <SummaryMiniCard
      label="Bonus"
      value={bonusLabel}
      helper={
        bonusDetails
          ? `${Number(bonusDetails?.bonusPercent || 0).toFixed(2)}% bonus`
          : "Bonus not applied"
      }
      isDark={isDark}
      accent="green"
    />

    <SummaryMiniCard
      label="Request Type"
      value={requestTypeLabel}
      helper={
        isReinsuranceRequest
          ? "Insurance charge paid separately"
          : "Normal deposit request"
      }
      isDark={isDark}
      accent="purple"
    />

    <SummaryMiniCard
      label="Coverage Status"
      value={
        insuranceDetails?.status
          ? String(insuranceDetails.status).replaceAll("_", " ")
          : "N/A"
      }
      helper={
        insuranceDetails?.claimedAt
          ? `Claimed At: ${new Date(insuranceDetails.claimedAt).toLocaleString()}`
          : "Not claimed yet"
      }
      isDark={isDark}
      accent="blue"
    />

    <SummaryMiniCard
      label="Created"
      value={
        selectedDeposit?.createdAt
          ? new Date(selectedDeposit.createdAt).toLocaleString()
          : "N/A"
      }
      helper="Request created time"
      isDark={isDark}
      accent="default"
    />
  </div>

  <div
    className={`mt-5 rounded-2xl border p-4 ${
      isDark ? "border-white/10 bg-white/[0.03]" : "border-white bg-white"
    }`}
  >
    <p
      className={[
        "text-[11px] font-semibold uppercase tracking-[0.14em]",
        isDark ? "text-white/45" : "text-slate-500",
      ].join(" ")}
    >
      System Generated Note
    </p>

    {selectedDeposit?.summaryText ? (
      <p
        className={`mt-2 text-sm leading-7 whitespace-pre-line ${
          isDark ? "text-white/80" : "text-slate-700"
        }`}
      >
        {selectedDeposit.summaryText}
      </p>
    ) : (
      <p
        className={`mt-2 text-sm ${
          isDark ? "text-white/50" : "text-slate-500"
        }`}
      >
        No summary available for this deposit.
      </p>
    )}
  </div>
</div>





            <div
              className={`rounded-[24px] border p-5 ${
                isDark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-orange-100 bg-white"
              }`}
            >
              <div className="mb-4 flex items-center gap-2">
                <FileText
                  size={18}
                  className={isDark ? "text-orange-300" : "text-orange-600"}
                />
                <h3 className="text-base font-semibold">Extra Information</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <InfoCard
                  icon={<FileText size={18} />}
                  label="Transaction ID"
                  value={renderDetailValue(selectedDeposit?.transactionId)}
                />

                <InfoCard
                  icon={<Wallet size={18} />}
                  label="Final Payable Amount"
                  value={`$${Number(
                    selectedDeposit?.finalPayableAmount ||
                      selectedDeposit?.deposit ||
                      0
                  ).toFixed(2)}`}
                />

                <InfoCard
                  icon={<CircleCheckBig size={18} />}
                  label="Approved At"
                  value={
                    selectedDeposit?.approvedAt
                      ? new Date(selectedDeposit?.approvedAt).toLocaleString()
                      : "Not approved yet"
                  }
                />

                <InfoCard
                  icon={<User size={18} />}
                  label="Approved By"
                  value={renderDetailValue(selectedDeposit?.approvedBy)}
                />

                <InfoCard
                  icon={<FileText size={18} />}
                  label="Created At"
                  value={
                    selectedDeposit?.createdAt
                      ? new Date(selectedDeposit?.createdAt).toLocaleString()
                      : "N/A"
                  }
                />

                <InfoCard
                  icon={<FileText size={18} />}
                  label="Updated At"
                  value={
                    selectedDeposit?.updatedAt
                      ? new Date(selectedDeposit?.updatedAt).toLocaleString()
                      : "N/A"
                  }
                />

                <InfoCard
                  icon={<User size={18} />}
                  label="Country"
                  value={renderDetailValue(selectedDeposit?.user?.country)}
                />

                <InfoCard
                  icon={<ArrowLeftRight size={18} />}
                  label="Method"
                  value={renderDetailValue(selectedDeposit?.method)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DepositDetailsModal;