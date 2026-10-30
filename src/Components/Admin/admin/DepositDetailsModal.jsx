import { Badge, Modal, Readout, ReadoutStrip, Well } from "@/Components/ui";

/**
 * Deposit detail.
 *
 * Previously a hand-rolled `createPortal` overlay with three local card
 * components (`SummaryMiniCard`, `DetailStatCard`, `InfoCard`), each taking
 * an `isDark` prop and keeping its own accent map. It is now the design
 * system's modal, and the figures use the readout strip, so the deposit's
 * numbers line up the same way they do everywhere else.
 *
 * The three sections appear only when there is something in them: a plain
 * deposit shows one block rather than two empty ones labelled "Not Applied".
 */

const money = (value) =>
  "$" +
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const when = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
};

const insuranceTone = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "claimed") return "primary";
  if (normalized === "pending_coverage") return "warning";
  return "success";
};

const insuranceLabelFor = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "claimed") return "Claimed";
  if (normalized === "pending_coverage") return "Pending coverage";
  return "Active";
};

/** A labelled line inside a block. */
const DetailRow = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-3 border-b border-line py-1.5 last:border-b-0">
    <span className="lbl shrink-0">{label}</span>
    <span className="numeric min-w-0 truncate text-right text-xs text-text">
      {value ?? "—"}
    </span>
  </div>
);

const Section = ({ title, meta, children }) => (
  <div>
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="lbl-sm text-text">{title}</span>
      {meta}
    </div>
    <Well className="min-w-0">{children}</Well>
  </div>
);

const DepositDetailsModal = ({
  showDetails,
  setShowDetails,
  selectedDeposit,
  getStatusBadge,
  renderDetailValue,
}) => {
  const insuranceDetails = selectedDeposit?.insuranceDetails || null;
  const bonusDetails = selectedDeposit?.bonusDetails || null;

  const payableAmount = Number(
    selectedDeposit?.finalPayableAmount || selectedDeposit?.deposit || 0
  );

  const creditedAmount = Number(selectedDeposit?.baseDepositAmount || 0);

  const insuranceCharge = Number(
    selectedDeposit?.insuranceDetails?.insuranceChargeAmount || 0
  );

  const claimAmount = Number(
    selectedDeposit?.insuranceDetails?.claimAmount || 0
  );

  /* A reinsurance request pays less than it credits, because the cover charge
     and an earlier claim are netted off. That is the only way to tell the two
     kinds apart from the record. */
  const isReinsuranceRequest =
    Boolean(selectedDeposit?.insuranceDetails) &&
    payableAmount > 0 &&
    creditedAmount > 0 &&
    payableAmount < creditedAmount;

  return (
    <Modal
      open={!!showDetails}
      onClose={() => setShowDetails(false)}
      title="Deposit detail"
      size="lg"
    >
      {selectedDeposit ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge?.(selectedDeposit?.status)}
            <Badge
              tone={isReinsuranceRequest ? "primary" : "neutral"}
              dot={false}
            >
              {isReinsuranceRequest ? "Reinsurance deposit" : "Standard deposit"}
            </Badge>
          </div>

          <ReadoutStrip>
            <Readout
              label="Paid by client"
              value={money(selectedDeposit?.deposit)}
              helper={`Method: ${renderDetailValue?.(selectedDeposit?.method)}`}
              tone="brand"
            />
            <Readout
              label="Credited to account"
              value={money(selectedDeposit?.baseDepositAmount)}
              helper={`Type: ${renderDetailValue?.(
                selectedDeposit?.accountType
              )}`}
              trend="up"
              tone="ok"
            />
            <Readout
              label="Bonus"
              value={bonusDetails ? money(bonusDetails?.bonusAmount) : "—"}
              helper={
                bonusDetails
                  ? `${Number(bonusDetails?.bonusPercent || 0)}% applied`
                  : "Not applied"
              }
              tone={bonusDetails ? "ok" : undefined}
            />
            <Readout
              label="Insurance charge"
              value={insuranceDetails ? money(insuranceCharge) : "—"}
              helper={insuranceDetails ? "Cover purchased" : "Not applied"}
              tone={insuranceDetails ? "warn" : undefined}
            />
          </ReadoutStrip>

          <Section title="Account">
            <DetailRow
              label="MT5 account"
              value={renderDetailValue?.(selectedDeposit?.mt5Account)}
            />
            <DetailRow
              label="Account type"
              value={renderDetailValue?.(selectedDeposit?.accountType)}
            />
            <DetailRow
              label="Method"
              value={renderDetailValue?.(selectedDeposit?.method)}
            />
            <DetailRow
              label="Final payable"
              value={money(payableAmount)}
            />
            <DetailRow
              label="Requested"
              value={when(selectedDeposit?.createdAt)}
            />
          </Section>

          {insuranceDetails ? (
            <Section
              title="Insurance"
              meta={
                <Badge
                  tone={insuranceTone(insuranceDetails?.status)}
                  dot={false}
                >
                  {insuranceLabelFor(insuranceDetails?.status)}
                </Badge>
              }
            >
              <DetailRow
                label="Coverage id"
                value={renderDetailValue?.(insuranceDetails?.coverageId)}
              />
              <DetailRow
                label="Charge"
                value={money(insuranceDetails?.insuranceChargeAmount)}
              />
              <DetailRow label="Claim amount" value={money(claimAmount)} />
              <DetailRow
                label="Claimed at"
                value={when(insuranceDetails?.claimedAt)}
              />
              <DetailRow
                label="Last updated"
                value={when(insuranceDetails?.updatedAt)}
              />
            </Section>
          ) : null}

          {bonusDetails ? (
            <Section title="Bonus">
              <DetailRow
                label="Deposit considered"
                value={money(bonusDetails?.depositAmount)}
              />
              <DetailRow
                label="Bonus percent"
                value={`${Number(bonusDetails?.bonusPercent || 0)}%`}
              />
              <DetailRow
                label="Bonus amount"
                value={money(bonusDetails?.bonusAmount)}
              />
            </Section>
          ) : null}

          {!insuranceDetails && !bonusDetails ? (
            <p className="text-xs text-subtle">
              No bonus or insurance was applied to this deposit.
            </p>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
};

export default DepositDetailsModal;
