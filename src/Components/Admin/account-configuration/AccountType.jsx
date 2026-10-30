import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { superAdminApi } from "../../../utils/apiClients";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DataTable,
  EmptyState,
  Field,
  FormPage,
  Input,
  SectionStep,
  Well,
} from "@/Components/ui";

/**
 * Account types.
 *
 * The entry archetype: the type being defined is one column of grouped
 * fields, the summary rail counts what it will contain, and the existing
 * types are a table below.
 *
 * Leverage and account-size pairs are repeating rows. Each pair gets its own
 * Add / Remove control rather than a fixed count, and the last row cannot be
 * removed — a type with no leverage option is not a usable type.
 */

const AccountTypes = () => {
  const [accountTypes, setAccountTypes] = useState([]);
  const [existingData, setExistingData] = useState([]);
  const [newAccountType, setNewAccountType] = useState({
    accountType: "",
    apiGroup: "",
    leverage: [{ label: "", value: "" }],
    accountSize: [{ deposit: "", balance: "" }],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchAccountTypes = async () => {
    setIsFetching(true);
    try {
      const res = await superAdminApi.get(`/get-custom-groups`);
      setAccountTypes(res.data.data || []);
    } catch (error) {
      console.log("Error fetching account types", error);
      toast.error("Failed to fetch account types");
    } finally {
      setIsFetching(false);
    }
  };

  const fetchExistingData = async () => {
    setIsFetching(true);
    try {
      const res = await superAdminApi.get(`/get-account-types`);
      setExistingData(res.data.data || []);
    } catch (error) {
      console.log("Error fetching existing account types data", error);
      toast.error("Failed to fetch existing data");
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e, index, field, subfield) => {
    const { name, value } = e.target;

    setNewAccountType((prev) => {
      const updated = { ...prev };

      if (field) {
        updated[field][index][subfield] = value;
      } else if (name === "accountType") {
        const selectedType = accountTypes.find(
          (type) => type.customGroup === value
        );

        if (selectedType) {
          updated.accountType = selectedType.customGroup;
          updated.apiGroup = selectedType.apiGroup;
        } else {
          updated.accountType = value;
          updated.apiGroup = "";
        }
      } else {
        updated[name] = value;
      }

      return updated;
    });
  };

  const addField = (field) => {
    setNewAccountType((prev) => ({
      ...prev,
      [field]: [
        ...prev[field],
        field === "leverage"
          ? { label: "", value: "" }
          : { deposit: "", balance: "" },
      ],
    }));
  };

  const removeField = (field, index) => {
    setNewAccountType((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await superAdminApi.post(`/add-account-type`, {
        apiGroup: newAccountType.apiGroup,
        accountType: newAccountType.accountType,
        leverage: newAccountType.leverage,
        accountSize: newAccountType.accountSize,
      });

      if (res.data.status) {
        setNewAccountType({
          accountType: "",
          apiGroup: "",
          leverage: [{ label: "", value: "" }],
          accountSize: [{ deposit: "", balance: "" }],
        });

        toast.success("Account type added successfully!");
        fetchExistingData();
      }
    } catch (error) {
      console.error("Error adding account type:", error);
      toast.error("Failed to add account type");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHandler = async (id, accountTypeName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the account type "${accountTypeName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await superAdminApi.delete(`/delete-account-type?id=${id}`);
      toast.success("Account type deleted successfully!");
      fetchExistingData();
    } catch (error) {
      console.error("Error deleting account type:", error);
      toast.error("Failed to delete account type");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAccountTypes();
    fetchExistingData();
  };

  useEffect(() => {
    fetchAccountTypes();
    fetchExistingData();
  }, []);

  const columns = [
    {
      key: "accountType",
      header: "Account type",
      primary: true,
      cell: (type) => (
        <div className="min-w-0">
          <div className="truncate font-semibold text-text">
            {type.accountType}
          </div>
          {type.apiGroup ? (
            <div className="numeric mt-0.5 truncate text-xs text-subtle">
              {type.apiGroup}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "leverage",
      header: "Leverage",
      secondary: true,
      cardFull: true,
      cell: (type) =>
        type.leverage?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {type.leverage.map((lev, i) => (
              <Badge key={`${lev.label}-${i}`} tone="neutral" dot={false}>
                {lev.label || "—"}
                {lev.value ? ` · ${lev.value}` : ""}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-subtle">None</span>
        ),
    },
    {
      key: "accountSize",
      header: "Sizes",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (type) => type.accountSize?.length ?? 0,
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      cardFull: true,
      cell: (type) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="danger-soft"
            onClick={() => deleteHandler(type._id, type.accountType)}
            disabled={isLoading}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  /**
   * A repeating pair of fields, with its own add / remove control.
   * `pair` names the two subfields explicitly — deriving them from the
   * labels or from key order would break the moment either changed.
   */
  const pairRows = (field, pair) => (
    <div className="space-y-2">
      {newAccountType[field].map((row, index) => (
        <Well key={index} className="min-w-0">
          <div className="grid gap-2.5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            {pair.map(({ key, label, placeholder }) => (
              <Field
                key={key}
                label={label}
                htmlFor={`${field}-${index}-${key}`}
              >
                <Input
                  id={`${field}-${index}-${key}`}
                  value={row[key] ?? ""}
                  onChange={(e) => handleInputChange(e, index, field, key)}
                  placeholder={placeholder}
                  className="numeric"
                />
              </Field>
            ))}

            <Button
              variant="danger-soft"
              onClick={() => removeField(field, index)}
              disabled={newAccountType[field].length <= 1}
            >
              Remove
            </Button>
          </div>
        </Well>
      ))}

      <Button variant="soft" onClick={() => addField(field)}>
        Add another
      </Button>
    </div>
  );

  const existingTable = (
    <Card>
      <CardHeader
        title="Existing account types"
        subtitle={`${existingData.length} defined.`}
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRefresh}
            loading={isFetching}
          >
            Refresh
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={existingData}
        loading={isFetching}
        empty={
          <EmptyState
            title="No account types"
            description="Define the first one using the form above."
          />
        }
      />
    </Card>
  );

  const missing = [];
  if (!newAccountType.accountType) missing.push("account type");
  if (!newAccountType.leverage.some((l) => l.label && l.value))
    missing.push("at least one leverage pair");
  if (!newAccountType.accountSize.some((s) => s.deposit && s.balance))
    missing.push("at least one account size");

  return (
    <FormPage
      breadcrumb="Configuration / Account types"
      title="Account types"
      description="The leverage options and deposit-to-balance sizes each type offers."
      summary={{
        title: "Will create",
        rows: [
          { label: "Account type", value: newAccountType.accountType || "—" },
          { label: "API group", value: newAccountType.apiGroup || "—" },
          {
            label: "Leverage options",
            value: newAccountType.leverage.filter((l) => l.label && l.value)
              .length,
          },
          {
            label: "Account sizes",
            value: newAccountType.accountSize.filter(
              (s) => s.deposit && s.balance
            ).length,
            weight: "bold",
          },
        ],
      }}
      submit={{
        label: "Add account type",
        onClick: () => handleSubmit({ preventDefault: () => {} }),
        loading: isLoading,
        disabled: missing.length > 0,
        reason: missing.length ? `Still needed: ${missing.join(", ")}` : undefined,
      }}
      below={existingTable}
      wide
    >
      <SectionStep
        index={1}
        title="Which group"
        hint="Picking a custom group fills the API group for you."
      >
        <Field label="Account type" htmlFor="at-type" required>
          <Input
            id="at-type"
            name="accountType"
            list="at-group-options"
            value={newAccountType.accountType}
            onChange={(e) => handleInputChange(e)}
            placeholder="Standard"
          />
        </Field>

        {/* A datalist rather than a select: existing groups are suggested, but
            a new name can still be typed, which the original allowed. */}
        <datalist id="at-group-options">
          {accountTypes.map((type) => (
            <option key={type._id} value={type.customGroup} />
          ))}
        </datalist>

        <Field
          label="API group"
          htmlFor="at-api"
          className="mt-3"
          hint="Filled automatically when the type matches a known custom group."
        >
          <Input
            id="at-api"
            name="apiGroup"
            value={newAccountType.apiGroup}
            onChange={(e) => handleInputChange(e)}
            placeholder="real\\Standard"
            className="numeric"
          />
        </Field>
      </SectionStep>

      <SectionStep
        index={2}
        title="Leverage options"
        hint="What the client can choose from, e.g. 1:100."
      >
        {pairRows("leverage", [
          { key: "label", label: "Label", placeholder: "1:100" },
          { key: "value", label: "Value", placeholder: "100" },
        ])}
      </SectionStep>

      <SectionStep
        index={3}
        title="Account sizes"
        hint="What balance a given deposit opens the account with."
      >
        {pairRows("accountSize", [
          { key: "deposit", label: "Deposit", placeholder: "100" },
          { key: "balance", label: "Balance", placeholder: "10000" },
        ])}
      </SectionStep>
    </FormPage>
  );
};

export default AccountTypes;
