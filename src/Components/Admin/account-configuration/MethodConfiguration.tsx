import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { adminApi } from "../../../utils/apiClients";
import {
  Badge,
  BlotterPage,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Input,
  Modal,
  SegmentedControl,
  Textarea,
} from "@/Components/ui";

/**
 * Payment method configuration.
 *
 * Two kinds of record — gateway methods and bank-transfer details — so this
 * is one blotter with a segmented control rather than two screens or two
 * hand-built tables. The "add" form for the active kind sits above the list,
 * because adding and reviewing are the same visit.
 *
 * The framer-motion stagger that wrapped every row is gone: these rows are
 * compared against each other, and animating them in sequence delays that.
 */

export default function MethodConfiguration() {
  const [arrayData, setArrayData] = useState<any[]>([]);
  const [bankData, setBankData] = useState<any[]>([]);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [popupImageUrl, setPopupImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState<
    "payment-methods" | "bank-transfer"
  >("payment-methods");

  const [newField, setNewField] = useState<{
    name: string;
    details: string;
    image: File | null;
    status: "active" | "inactive";
  }>({
    name: "",
    details: "",
    image: null,
    status: "active",
  });

  const [newBankField, setNewBankField] = useState<any>({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    ifscCode: "",
    branchName: "",
    status: "active",
    name: "Bank Transfer",
  });

  const addField = async () => {
    const toastId = toast.loading("Processing...");
    if (!newField.name || !newField.details) {
      toast.error("Name and details are required", { id: toastId });
      return;
    }

    try {
      let res;
      if (newField.image) {
        const formData = new FormData();
        formData.append("name", newField.name);
        formData.append("details", newField.details);
        formData.append("status", newField.status);
        formData.append("image", newField.image);

        res = await adminApi.post(`/add-payment-method`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await adminApi.post(`/add-payment-method`, {
          name: newField.name,
          details: newField.details,
          status: newField.status,
        });
      }

      if (res.data.status) {
        setArrayData((prev) => [...prev, res.data.data]);
        toast.success("Method added successfully", { id: toastId });
        setNewField({ name: "", details: "", image: null, status: "active" });
      } else {
        toast.error(res.data.msg || "Failed to add payment method", {
          id: toastId,
        });
      }
    } catch (error: any) {
      const code = error?.response?.data?.error?.code;
      if (code === "ENOENT") {
        toast.error("File storage unavailable on server. Try without an image.", {
          id: toastId,
        });
      } else {
        toast.error(error?.response?.data?.msg || "Server error occurred", {
          id: toastId,
        });
      }
      console.log("error in add payment method", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewField((nf) => ({ ...nf, image: file }));
  };

  const toggleActive = async (id: string, currentStatus: "active" | "inactive") => {
    const toastId = toast.loading("Updating status...");
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await adminApi.put(`/update-payment-method`, {
        id,
        status: newStatus,
      });
      if (res.data.status) {
        setArrayData((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
        );
        toast.success("Status updated", { id: toastId });
      } else {
        toast.error(res.data.msg || "Failed to update status", { id: toastId });
      }
    } catch (error) {
      console.error("Error in payment method toggleActive:", error);
      toast.error("Update failed", { id: toastId });
    }
  };

  const deletePlatform = async (id: string) => {
    const toastId = toast.loading("Removing method...");
    try {
      const res = await adminApi.delete(`/delete-payment-method/?id=${id}`);
      if (res.data.status) {
        setArrayData((prev) => prev.filter((p) => p._id !== id));
        toast.success("Method removed successfully", { id: toastId });
      } else {
        toast.error(res.data.msg || "Removal failed", { id: toastId });
      }
    } catch (error) {
      console.log("error in delete method", error);
      toast.error("Transaction error", { id: toastId });
    }
  };

  const getAllPlatforms = async () => {
    try {
      const res = await adminApi.get(`/get-payment-methods`);
      const filterNotBankData = (res.data.data || []).filter(
        (v: any) => v.name !== "Bank Transfer"
      );
      setArrayData(filterNotBankData);
    } catch (error) {
      console.log("error in getAllPlatform", error);
    }
  };

  const handleViewImage = (imageUrl?: string) => {
    setPopupImageUrl(imageUrl || "");
    setShowImagePopup(true);
  };

  const addBankDetails = async () => {
    const toastId = toast.loading("Adding bank details...");
    if (
      !newBankField.bankName ||
      !newBankField.accountNumber ||
      !newBankField.accountHolderName ||
      !newBankField.ifscCode
    ) {
      toast.error("Please fill all required fields", { id: toastId });
      return;
    }

    try {
      const res = await adminApi.post(`/add-payment-method`, newBankField);
      if (res.data.status) {
        setBankData((prev) => [...prev, res.data.data]);
        toast.success("Bank details added", { id: toastId });
        setNewBankField({
          bankName: "",
          accountNumber: "",
          accountHolderName: "",
          ifscCode: "",
          branchName: "",
          status: "active",
          name: "Bank Transfer",
        });
      } else {
        toast.error(res.data.msg || "Failed to add bank details", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("Something went wrong", { id: toastId });
      console.log("error in add bank details", error);
    }
  };

  const toggleBankActive = async (
    id: string,
    currentStatus: "active" | "inactive"
  ) => {
    const toastId = toast.loading("Updating status...");
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await adminApi.put(`/update-payment-method`, {
        id,
        status: newStatus,
      });
      if (res.data.status) {
        setBankData((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
        );
        toast.success("Status updated", { id: toastId });
      } else {
        toast.error(res.data.msg || "Failed to update bank status", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Error in bank toggleActive:", error);
      toast.error("Something went wrong", { id: toastId });
    }
  };

  const deleteBank = async (id: string) => {
    const toastId = toast.loading("Removing bank details...");
    try {
      const res = await adminApi.delete(`/delete-payment-method/?id=${id}`);
      if (res.data.status) {
        setBankData((prev) => prev.filter((b) => b._id !== id));
        toast.success("Bank details removed", { id: toastId });
      } else {
        toast.error(res.data.msg || "Removal failed", { id: toastId });
      }
    } catch (error) {
      console.log("error in delete bank", error);
      toast.error("Transaction error", { id: toastId });
    }
  };

  const getAllBankDetails = async () => {
    try {
      const res = await adminApi.get(`/get-payment-methods`);
      const filterBankData = (res.data.data || []).filter(
        (v: any) => v.name === "Bank Transfer"
      );
      setBankData(filterBankData);
    } catch (error) {
      console.log("error in getAllBankDetails", error);
    }
  };

  useEffect(() => {
    getAllPlatforms();
    getAllBankDetails();
  }, []);

  const isAddButtonDisabled = !newField.name || !newField.details;
  const isBankAddButtonDisabled =
    !newBankField.bankName ||
    !newBankField.accountNumber ||
    !newBankField.accountHolderName ||
    !newBankField.ifscCode;

  const isBank = activeTab === "bank-transfer";

  const methodColumns = [
    {
      key: "name",
      header: "Method",
      primary: true,
      cell: (platform: any) => (
        <div className="min-w-0">
          <div className="truncate font-semibold text-text">
            {platform?.name || "—"}
          </div>
          {platform?.image ? (
            <button
              type="button"
              onClick={(e: any) => {
                e.stopPropagation();
                handleViewImage(platform?.image);
              }}
              className="lbl-sm mt-0.5 text-primary hover:underline"
            >
              View QR / logo
            </button>
          ) : (
            <span className="text-[11px] text-subtle">No image</span>
          )}
        </div>
      ),
    },
    {
      key: "details",
      header: "Details",
      secondary: true,
      cardFull: true,
      cell: (platform: any) => (
        <span className="numeric block min-w-0 truncate text-xs text-muted">
          {platform?.details || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (platform: any) => (
        <Badge
          tone={platform?.status === "active" ? "success" : "neutral"}
          dot={false}
        >
          {platform?.status === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cardFull: true,
      cell: (platform: any) => (
        <div className="flex justify-end gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e: any) => {
              e.stopPropagation();
              toggleActive(platform._id, platform.status);
            }}
          >
            {platform?.status === "active" ? "Deactivate" : "Activate"}
          </Button>
          <Button
            size="sm"
            variant="danger-soft"
            onClick={(e: any) => {
              e.stopPropagation();
              deletePlatform(platform._id);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const bankColumns = [
    {
      key: "bankName",
      header: "Bank",
      primary: true,
      cell: (bank: any) => (
        <div className="min-w-0">
          <div className="truncate font-semibold text-text">
            {bank?.bankTransfer?.bankName || "—"}
          </div>
          <div className="truncate text-xs text-subtle">
            {bank?.bankTransfer?.branchName || "No branch"}
          </div>
        </div>
      ),
    },
    {
      key: "accountHolderName",
      header: "Holder",
      secondary: true,
      cell: (bank: any) => bank?.bankTransfer?.accountHolderName || "—",
    },
    {
      key: "accountNumber",
      header: "Account number",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (bank: any) => bank?.bankTransfer?.accountNumber || "—",
    },
    {
      key: "ifscCode",
      header: "IFSC",
      numeric: true,
      cell: (bank: any) => bank?.bankTransfer?.ifscCode || "—",
    },
    {
      key: "status",
      header: "Status",
      cell: (bank: any) => (
        <Badge
          tone={bank?.status === "active" ? "success" : "neutral"}
          dot={false}
        >
          {bank?.status === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cardFull: true,
      cell: (bank: any) => (
        <div className="flex justify-end gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e: any) => {
              e.stopPropagation();
              toggleBankActive(bank._id, bank.status);
            }}
          >
            {bank?.status === "active" ? "Deactivate" : "Activate"}
          </Button>
          <Button
            size="sm"
            variant="danger-soft"
            onClick={(e: any) => {
              e.stopPropagation();
              deleteBank(bank._id);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const statusToggle = (value: string, onChange: (v: string) => void) => (
    <SegmentedControl
      value={value}
      onChange={onChange}
      options={[
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ]}
    />
  );

  const addMethodForm = (
    <Card className="mb-2">
      <CardHeader
        title="Add a payment method"
        subtitle="Name and details are required; the image is the QR or logo clients see."
        className="px-3.5 py-2.5"
      />

      <div className="grid gap-3 p-3.5 lg:grid-cols-2">
        <Field label="Method name" htmlFor="pm-name" required>
          <Input
            id="pm-name"
            value={newField.name}
            onChange={(e) =>
              setNewField((nf) => ({ ...nf, name: e.target.value }))
            }
            placeholder="USDT (TRC20)"
          />
        </Field>

        <Field label="Status">{statusToggle(newField.status, (v) =>
          setNewField((nf) => ({ ...nf, status: v as "active" | "inactive" }))
        )}</Field>

        <Field
          label="Details"
          htmlFor="pm-details"
          required
          className="lg:col-span-2"
          hint="The address, ID or instructions shown to the client."
        >
          <Textarea
            id="pm-details"
            rows={3}
            value={newField.details}
            onChange={(e) =>
              setNewField((nf) => ({ ...nf, details: e.target.value }))
            }
            placeholder="TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="numeric"
          />
        </Field>

        <Field
          label="Image"
          htmlFor="pm-image"
          className="lg:col-span-2"
          hint={
            newField.image
              ? newField.image.name
              : "Optional. If the server has no file storage, add the method without one."
          }
        >
          <input
            id="pm-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full cursor-pointer rounded-field border border-line bg-surface-2 p-2 text-xs text-muted file:mr-2 file:rounded-field file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-on"
          />
        </Field>

        <div className="flex flex-wrap gap-2 lg:col-span-2">
          <Button onClick={addField} disabled={isAddButtonDisabled}>
            Add method
          </Button>
          {newField.image ? (
            <Button
              variant="secondary"
              onClick={() => setNewField((nf) => ({ ...nf, image: null }))}
            >
              Clear image
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );

  const addBankForm = (
    <Card className="mb-2">
      <CardHeader
        title="Add bank transfer details"
        subtitle="Bank, account number, holder and IFSC are required."
        className="px-3.5 py-2.5"
      />

      <div className="grid gap-3 p-3.5 lg:grid-cols-2">
        <Field label="Bank name" htmlFor="bk-bank" required>
          <Input
            id="bk-bank"
            value={newBankField.bankName}
            onChange={(e) =>
              setNewBankField((b: any) => ({ ...b, bankName: e.target.value }))
            }
            placeholder="State Bank of India"
          />
        </Field>

        <Field label="Account holder" htmlFor="bk-holder" required>
          <Input
            id="bk-holder"
            value={newBankField.accountHolderName}
            onChange={(e) =>
              setNewBankField((b: any) => ({
                ...b,
                accountHolderName: e.target.value,
              }))
            }
            placeholder="Full name on the account"
          />
        </Field>

        <Field label="Account number" htmlFor="bk-account" required>
          <Input
            id="bk-account"
            value={newBankField.accountNumber}
            onChange={(e) =>
              setNewBankField((b: any) => ({
                ...b,
                accountNumber: e.target.value,
              }))
            }
            className="numeric"
          />
        </Field>

        <Field label="IFSC code" htmlFor="bk-ifsc" required>
          <Input
            id="bk-ifsc"
            value={newBankField.ifscCode}
            onChange={(e) =>
              setNewBankField((b: any) => ({ ...b, ifscCode: e.target.value }))
            }
            className="numeric"
          />
        </Field>

        <Field label="Branch" htmlFor="bk-branch">
          <Input
            id="bk-branch"
            value={newBankField.branchName}
            onChange={(e) =>
              setNewBankField((b: any) => ({
                ...b,
                branchName: e.target.value,
              }))
            }
            placeholder="Optional"
          />
        </Field>

        <Field label="Status">{statusToggle(newBankField.status, (v) =>
          setNewBankField((b: any) => ({ ...b, status: v }))
        )}</Field>

        <div className="lg:col-span-2">
          <Button onClick={addBankDetails} disabled={isBankAddButtonDisabled}>
            Add bank details
          </Button>
        </div>
      </div>
    </Card>
  );

  const rows = isBank ? bankData : arrayData;
  const activeCount = rows.filter((r: any) => r?.status === "active").length;

  return (
    <>
      <BlotterPage
        breadcrumb="Configuration / Payment methods"
        title="Payment methods"
        description="Gateways and bank accounts clients can deposit to."
        actions={
          <>
            <SegmentedControl
              value={activeTab}
              onChange={(v: string) => setActiveTab(v as typeof activeTab)}
              options={[
                { value: "payment-methods", label: "Methods" },
                { value: "bank-transfer", label: "Bank transfer" },
              ]}
            />
            <Button
              variant="secondary"
              onClick={() => {
                getAllPlatforms();
                getAllBankDetails();
              }}
            >
              Refresh
            </Button>
          </>
        }
        readouts={[
          {
            key: "methods",
            label: "Gateway methods",
            value: arrayData.length,
            helper: `${
              arrayData.filter((m: any) => m?.status === "active").length
            } active`,
            tone: "brand",
          },
          {
            key: "banks",
            label: "Bank accounts",
            value: bankData.length,
            helper: `${
              bankData.filter((b: any) => b?.status === "active").length
            } active`,
            tone: "brand",
          },
          {
            key: "live",
            label: "Live on this tab",
            value: `${activeCount} / ${rows.length}`,
            tone: activeCount ? "ok" : "warn",
            helper: activeCount ? undefined : "Clients cannot deposit",
          },
        ]}
        columns={isBank ? bankColumns : methodColumns}
        rows={rows}
        rowEdge={(row: any) => (row?.status === "active" ? null : "warning")}
        empty={
          <EmptyState
            title={isBank ? "No bank accounts" : "No payment methods"}
            description={
              isBank
                ? "Add bank transfer details using the form above."
                : "Add a gateway method using the form above."
            }
          />
        }
      >
        {isBank ? addBankForm : addMethodForm}
      </BlotterPage>

      <Modal
        open={showImagePopup}
        onClose={() => setShowImagePopup(false)}
        title="Method image"
        size="md"
      >
        {popupImageUrl ? (
          <img
            src={popupImageUrl}
            alt="Payment method"
            className="mx-auto max-h-[70vh] w-auto rounded-field border border-line"
          />
        ) : (
          <EmptyState
            title="No image"
            description="This method has no image attached."
          />
        )}
      </Modal>
    </>
  );
}
