import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { adminApi } from "../../../utils/apiClients";
import {
  CFcalculateTimeSinceJoined,
  CFformatDate,
} from "../../../utils/CustomFunctions";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  ReviewPage,
  ReviewSection,
  SearchInput,
  Textarea,
} from "@/Components/ui";

const PAGE_LIMIT = 10;

/**
 * KYC review.
 *
 * This was a table of applicants whose documents opened in a modal, so
 * reviewing meant list → modal → close → list for every applicant. It is now
 * the record archetype: the queue stays in a pane on the left, the applicant's
 * documents fill the middle, and the decision sits beside them. Prev / Next
 * walks the queue without a round trip.
 */

const KycUsers = () => {
  const [kycUsers, setKycUsers] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    search: "",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState<any>({});
  const [comment, setComment] = useState("");
  const [actionLoading, setActionLoading] = useState<"" | "approve" | "reject">(
    ""
  );

  const totalPages = Math.max(
    1,
    Number(pagination?.totalPages) ||
      Math.ceil((Number(pagination?.totalUsers) || 0) / PAGE_LIMIT)
  );

  const updateFilter = (key: string, value: string) => {
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setCurrentPage(1);
    setFilters({
      search: "",
    });
    setDebouncedSearch("");
  };

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(
        `/kyc-users?page=${currentPage}&limit=${PAGE_LIMIT}&search=${encodeURIComponent(
          debouncedSearch
        )}`
      );
      setPagination(res.data?.pagination || {});
      setKycUsers(res.data?.data || []);
    } catch (error) {
      toast.error("Something went wrong");
      console.log("Error fetching KYC users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (
    user: any,
    action: "approve" | "reject"
  ) => {
    setActionLoading(action);
    const toastId = toast.loading("Please wait...");
    try {
      const actionMessage =
        action === "approve"
          ? `<p>Your KYC has been successfully verified. Thank you for completing the verification process.</p>`
          : `<p>Unfortunately, your KYC verification was not successful. Please check your details and submit again.</p>`;

      const rejectionReason =
        action === "reject"
          ? `<div class="withdrawal-details">
              <p>Reason: <span class="highlight">${
                comment || "Contact Admin"
              }</span></p>
            </div>`
          : "";

      const customContent = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>KYC Verification Status</title>
<style>
body,html{margin:0;padding:0;font-family:Arial,sans-serif;line-height:1.6;color:#333;background:#f3f5f9}
.container{max-width:600px;margin:0 auto;background:#fff}
.header{background:#19422df2;color:#fff;padding:20px 15px;text-align:center;border-radius:10px 10px 0 0}
.header h1{margin:0;font-size:22px;letter-spacing:1px}
.content{padding:10px 20px}
.withdrawal-details{background:#f8f8f8;border-left:4px solid #0f9f6e;padding:15px;margin:20px 0}
.highlight{font-weight:700;color:#0a2342}
.risk-warning{color:#C70039;padding:5px;font-size:12px;line-height:1.4}
.footer{background:#19422df2;color:#fff;text-align:center;padding:5px 10px;font-size:12px;border-radius:0 0 10px 10px}
.footer-info{margin-top:6px}
.footer-info a{color:#bed2ff;text-decoration:none}
</style></head>
<body><div class="container">
<div class="header"><h1>${
        action === "approve" ? "KYC Approved" : "KYC Rejected"
      }</h1></div>
<div class="content">
<p>Dear ${user?.firstName || ""} ${user?.lastName || ""},</p>
${actionMessage}
${rejectionReason}
<p>Thank you for choosing us.</p>
<p>Happy trading!</p>
<p>Best regards,<br>The ${
        import.meta.env.VITE_WEBSITE_NAME || "Forex"
      } Team</p>
<hr>
<div class="risk-warning"><strong>Risk Warning:</strong> Trading CFDs carries high risk and may result in losses beyond your initial investment. Trade only with money you can afford to lose and understand the risks.<br><br>Our services are not for U.S. citizens or in jurisdictions where they violate local laws.</div>
</div>
<div class="footer">
  <div class="footer-info">
    <p>Website: <a href="https://${
      import.meta.env.VITE_EMAIL_WEBSITE || ""
    }">${import.meta.env.VITE_EMAIL_WEBSITE || ""}</a> |
    E-mail: <a href="mailto:${
      import.meta.env.VITE_EMAIL_EMAIL || ""
    }">${import.meta.env.VITE_EMAIL_EMAIL || ""}</a></p>
    <p>© 2025 ${
      import.meta.env.VITE_WEBSITE_NAME || ""
    }. All Rights Reserved</p>
  </div>
</div>
</div></body></html>`;

      if (action === "approve") {
        await adminApi.put(`/update-user`, { id: user._id, kycVerified: true });
        await adminApi.put(`/user/${user?._id}/kyc-status`, {
          status: "approved",
        });

        toast.success("KYC Approved", { id: toastId });

        try {
          await adminApi.post(`/custom-mail`, {
            email: user?.email,
            content: customContent,
            subject: "KYC Approved",
          });
        } catch (err) {
          console.log("error sending mail", err);
        }
      } else {
        await adminApi.put(`/update-user`, { id: user._id, kycVerified: false });
        await adminApi.put(`/user/${user?._id}/kyc-status`, {
          status: "rejected",
        });

        toast.success("KYC Rejected", { id: toastId });

        try {
          await adminApi.post(`/custom-mail`, {
            email: user?.email,
            content: customContent,
            subject: "KYC Rejected",
          });
        } catch (err) {
          console.log("error sending mail", err);
        }
      }

      setComment("");
      setSelectedId(null); // the decided applicant leaves the queue on refetch
      await fetchUsersData();
    } catch (error: any) {
      console.error("Error updating KYC status:", error);
      toast.error(`${error?.response?.data?.message || "Something went wrong"}`, {
        id: toastId,
      });
    } finally {
      setActionLoading("");
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(handler);
  }, [filters.search]);

  useEffect(() => {
    fetchUsersData();
  }, [currentPage, debouncedSearch]);

  /* Keep a record on screen: when the queue reloads, hold the selection if
     that applicant is still pending, otherwise fall to the top of the queue. */
  useEffect(() => {
    if (!kycUsers.length) {
      setSelectedId(null);
      return;
    }

    const stillThere = kycUsers.some((u: any) => u?._id === selectedId);
    if (!stillThere) setSelectedId(kycUsers[0]?._id ?? null);
  }, [kycUsers, selectedId]);

  const imgUrl = (path?: string) =>
    path ? `${import.meta.env.VITE_API_BASE_URL}/${path}` : "";

  const selectedIndex = useMemo(
    () => kycUsers.findIndex((u: any) => u?._id === selectedId),
    [kycUsers, selectedId]
  );

  const selectedUser = selectedIndex >= 0 ? kycUsers[selectedIndex] : null;

  const fullName = (u: any) =>
    [u?.firstName, u?.lastName].filter(Boolean).join(" ") || "Unnamed";

  const kyc = selectedUser?.kycDetails || {};

  const detail = (label: string, value: any) => (
    <div className="min-w-0">
      <div className="lbl">{label}</div>
      <div className="mt-0.5 truncate text-sm text-text">{value || "—"}</div>
    </div>
  );

  return (
    <ReviewPage
      className="min-h-[calc(100dvh-10rem)]"
      breadcrumb="Compliance / KYC"
      title={selectedUser ? fullName(selectedUser) : "KYC review"}
      prev={{
        label: "Prev",
        disabled: selectedIndex <= 0,
        onClick: () => setSelectedId(kycUsers[selectedIndex - 1]?._id ?? null),
      }}
      next={{
        label: "Next",
        disabled: selectedIndex < 0 || selectedIndex >= kycUsers.length - 1,
        onClick: () => setSelectedId(kycUsers[selectedIndex + 1]?._id ?? null),
      }}
      queue={{
        title: "Pending KYC",
        count: kycUsers.length,
        items: kycUsers,
        toolbar: (
          <SearchInput
            value={filters.search}
            onChange={(e: any) => updateFilter("search", e.target.value)}
            placeholder="name, email, country"
          />
        ),
        empty: (
          <div className="p-3">
            <EmptyState
              title={loading ? "Loading queue" : "Queue is clear"}
              description={
                loading
                  ? "Fetching pending applications."
                  : filters.search
                  ? "No applicant matches that search."
                  : "No KYC applications are waiting."
              }
              action={
                filters.search ? (
                  <Button variant="soft" onClick={resetFilters}>
                    Clear search
                  </Button>
                ) : null
              }
            />
          </div>
        ),
        footer: (
          <>
            <span className="numeric text-[11px] text-subtle">
              Page {currentPage} / {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1 || loading}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </>
        ),
        renderItem: (item: any, _index: number, closeDrawer: () => void) => {
          const active = item?._id === selectedId;

          return (
            <button
              type="button"
              onClick={() => {
                setSelectedId(item?._id ?? null);
                setComment("");
                closeDrawer();
              }}
              className={[
                "tap w-full border-b border-line px-3 py-2.5 text-left transition",
                active
                  ? "border-l-2 border-l-primary bg-primary-soft"
                  : "hover:bg-surface-2",
              ].join(" ")}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-semibold text-text">
                  {fullName(item)}
                </span>
                <span className="numeric shrink-0 text-[10px] text-subtle">
                  {CFcalculateTimeSinceJoined(item?.updatedAt)}
                </span>
              </div>

              <div className="numeric mt-0.5 truncate text-xs text-subtle">
                {item?.email || "—"}
              </div>

              <div className="mt-1.5 flex items-center gap-1.5">
                <Badge tone="neutral" dot={false}>
                  {item?.country || "No country"}
                </Badge>
                <Badge
                  tone={item?.emailVerified ? "success" : "warning"}
                  dot={false}
                >
                  {item?.emailVerified ? "Email ok" : "Email unverified"}
                </Badge>
              </div>
            </button>
          );
        },
      }}
      aside={{
        title: "Decision",
        meta: selectedUser ? `${selectedIndex + 1} of ${kycUsers.length}` : undefined,
        children: selectedUser ? (
          <div className="space-y-3">
            <Field
              label="Comment"
              htmlFor="kyc-comment"
              hint="Sent to the applicant when a request is rejected."
            >
              <Textarea
                id="kyc-comment"
                placeholder="Why is this being rejected?"
                value={comment}
                onChange={(e: any) => setComment(e.target.value)}
                rows={5}
              />
            </Field>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="success"
                className="w-full"
                onClick={() => handleConfirmAction(selectedUser, "approve")}
                disabled={!!actionLoading}
                loading={actionLoading === "approve"}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => handleConfirmAction(selectedUser, "reject")}
                disabled={!!actionLoading}
                loading={actionLoading === "reject"}
              >
                Reject
              </Button>
            </div>

            <p className="text-xs text-subtle">
              Approving marks the account KYC-verified and emails the applicant.
              Rejecting emails them the comment above.
            </p>
          </div>
        ) : (
          <p className="text-sm text-subtle">
            Choose an applicant from the queue.
          </p>
        ),
      }}
    >
      {selectedUser ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ReviewSection title="Applicant">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {detail("Name", fullName(selectedUser))}
              {detail("Email", selectedUser?.email)}
              {detail("Country", selectedUser?.country)}
              {detail("Trading accounts", selectedUser?.accounts?.length ?? 0)}
              {detail(
                "Email verified",
                selectedUser?.emailVerified ? "Yes" : "No"
              )}
              {detail("Submitted", CFformatDate(selectedUser?.updatedAt))}
            </div>
          </ReviewSection>

          <ReviewSection title="Declared details">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {detail("Purpose", kyc?.purpose)}
              {detail("Occupation", kyc?.occupation)}
              {detail("Country of issue", kyc?.countryOfIssue)}
              {detail("Document type", kyc?.documentType)}
            </div>
          </ReviewSection>

          <ReviewSection title="Documents" meta="Tap an image to open it full size">
            <div className="grid gap-3 md:grid-cols-3">
              <KycImageCard
                title="Front of document"
                src={kyc?.frontSideOfDocument}
                imgUrl={imgUrl}
              />
              <KycImageCard
                title="Back of document"
                src={kyc?.backSideOfDocument}
                imgUrl={imgUrl}
              />
              <KycImageCard
                title="Selfie with document"
                src={kyc?.selfieWithDocument}
                imgUrl={imgUrl}
              />
            </div>
          </ReviewSection>
        </div>
      ) : (
        <div className="flex min-h-[320px] items-center justify-center p-6">
          <EmptyState
            title="Nothing selected"
            description="Pick an applicant from the queue to review their documents."
          />
        </div>
      )}
    </ReviewPage>
  );
};

/**
 * One document. The link is on the image itself as well as the caption, so a
 * reviewer can enlarge a blurry scan without hunting for a text link.
 */
const KycImageCard = ({
  title,
  src,
  imgUrl,
}: {
  title: string;
  src?: string;
  imgUrl: (p?: string) => string;
}) => (
  <div className="overflow-hidden rounded-field border border-line bg-surface-2">
    <div className="flex items-center justify-between gap-2 border-b border-line px-2.5 py-1.5">
      <span className="lbl-sm text-text">{title}</span>
      {src ? (
        <a
          target="_blank"
          rel="noreferrer"
          href={imgUrl(src)}
          className="lbl-sm text-primary hover:underline"
        >
          Full size
        </a>
      ) : null}
    </div>

    {src ? (
      <a target="_blank" rel="noreferrer" href={imgUrl(src)} className="block">
        <img
          className="mx-auto max-h-64 w-auto"
          src={imgUrl(src)}
          alt={title}
          loading="lazy"
        />
      </a>
    ) : (
      <div className="flex h-32 items-center justify-center text-sm text-subtle">
        Not uploaded
      </div>
    )}
  </div>
);

export default KycUsers;
