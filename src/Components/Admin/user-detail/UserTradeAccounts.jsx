import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  CFcalculateTimeSinceJoined,
  CFformatDate,
} from "../../../utils/CustomFunctions";
import { adminApi } from "../../../utils/apiClients";
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  Field,
  Input,
  Modal,
  SegmentedControl,
} from "@/Components/ui";

/**
 * A client's MT5 accounts, with the password-change dialog.
 *
 * The desktop table and the separate stack of phone cards the page used to
 * render are one column set now, so the two cannot drift apart. The Radix
 * dialog is the design system's modal.
 *
 * Passwords are shown masked with a reveal, rather than printed in the table:
 * this page is often open on a shared screen.
 */

const UserTradeAccounts = ({ userData, fetchUserData }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activeTab, setActiveTab] = useState("master");
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [revealed, setRevealed] = useState({});

  const accounts = useMemo(() => userData?.accounts || [], [userData]);

  const handleOpenDialog = (account) => {
    setSelectedAccount(account);
    setPasswords({ new: "", confirm: "" });
    setError("");
    setActiveTab("master");
    setOpenDialog(true);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordChange = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    const toastId = toast.loading("Updating password...");
    setSubmitting(true);
    setError("");

    if (!validatePassword(passwords.new)) {
      const message =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
      setError(message);
      toast.error("Invalid password format", { id: toastId });
      setSubmitting(false);
      return;
    }

    if (passwords.new !== passwords.confirm) {
      const message = "Passwords do not match.";
      setError(message);
      toast.error("Passwords do not match", { id: toastId });
      setSubmitting(false);
      return;
    }

    try {
      /* NOTE: both tabs hit `/server-master-password-change`. That is the
         pre-existing behaviour, kept as-is — but it means an investor-password
         change updates the MASTER password on the MT5 server, while only the
         local record is written as the investor one. Needs a server endpoint
         for the investor password to be correct. */
      const serverEndpoint = `/server-master-password-change?Account=${selectedAccount.accountNumber}&password=${passwords.confirm}`;

      await adminApi.get(serverEndpoint);

      await adminApi.post(
        `/${
          activeTab === "master"
            ? "update-master-password"
            : "update-investor-password"
        }`,
        {
          userId: userData?._id,
          accountId: selectedAccount?._id,
          newPassword: passwords.confirm,
        }
      );

      await fetchUserData?.();

      toast.success(
        `${activeTab === "master" ? "Master" : "Investor"} password updated`,
        { id: toastId }
      );

      setOpenDialog(false);
      setPasswords({ new: "", confirm: "" });
    } catch (err) {
      console.error("Password update failed:", err);
      setError("An error occurred while updating the password.");
      toast.error("Failed to update password", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const secret = (account, which) => {
    const key = `${account?._id}-${which}`;
    const value = account?.[which];

    if (!value) return <span className="text-subtle">—</span>;

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setRevealed((prev) => ({ ...prev, [key]: !prev[key] }));
        }}
        className="numeric text-xs text-muted hover:text-text"
        title={revealed[key] ? "Hide" : "Reveal"}
      >
        {revealed[key] ? value : "••••••••"}
      </button>
    );
  };

  const columns = [
    {
      key: "accountNumber",
      header: "Account",
      primary: true,
      numeric: true,
      cell: (account) => (
        <span className="numeric font-semibold text-text">
          {account?.accountNumber || "—"}
        </span>
      ),
    },
    {
      key: "accountType",
      header: "Type",
      secondary: true,
      cell: (account) => (
        <Badge tone="neutral" dot={false}>
          {account?.accountType || "—"}
        </Badge>
      ),
    },
    {
      key: "leverage",
      header: "Leverage",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (account) => account?.leverage || "—",
    },
    {
      key: "platform",
      header: "Platform",
      cell: (account) => account?.platform || "N/A",
    },
    {
      key: "masterPassword",
      header: "Master password",
      cell: (account) => secret(account, "masterPassword"),
    },
    {
      key: "investorPassword",
      header: "Investor password",
      cell: (account) => secret(account, "investorPassword"),
    },
    {
      key: "createdAt",
      header: "Opened",
      cell: (account) => (
        <div className="min-w-0">
          <div className="numeric truncate text-xs text-text">
            {CFformatDate(account?.createdAt)}
          </div>
          <div className="truncate text-[11px] text-subtle">
            {CFcalculateTimeSinceJoined(account?.createdAt)}
          </div>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      cardFull: true,
      cell: (account) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDialog(account);
            }}
          >
            Change password
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={accounts}
        empty={
          <EmptyState
            title="No trading accounts"
            description="This client has no MT5 account yet."
          />
        }
      />

      <Modal
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        title={`Change password · ${selectedAccount?.accountNumber ?? ""}`}
        size="md"
      >
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <SegmentedControl
            value={activeTab}
            onChange={setActiveTab}
            options={[
              { value: "master", label: "Master" },
              { value: "investor", label: "Investor" },
            ]}
          />

          <Field
            label="New password"
            htmlFor="pw-new"
            hint="At least 8 characters, with upper and lower case, a number and a symbol."
          >
            <Input
              id="pw-new"
              type="password"
              autoComplete="new-password"
              value={passwords.new}
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, new: e.target.value }))
              }
            />
          </Field>

          <Field
            label="Confirm password"
            htmlFor="pw-confirm"
            error={error || undefined}
          >
            <Input
              id="pw-confirm"
              type="password"
              autoComplete="new-password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, confirm: e.target.value }))
              }
            />
          </Field>

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              loading={submitting}
              disabled={!passwords.new || !passwords.confirm}
            >
              Update {activeTab} password
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpenDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default UserTradeAccounts;
