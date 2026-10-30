import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { adminApi } from "../../../utils/apiClients";
import {
  Badge,
  BlotterPage,
  Button,
  EmptyState,
  Input,
  Select,
} from "@/Components/ui";

/**
 * IB commission levels.
 *
 * Ten levels per account type, each a single number. The page is a blotter so
 * the level, its commission and the edit control line up in one column set,
 * and the account type is the filter bar's select — switching it reloads the
 * ten rows rather than navigating anywhere.
 *
 * The animated grid, floating particles and framer-motion stagger that used
 * to wrap this screen are gone: they moved the rows a reader is trying to
 * compare against each other.
 */

const LEVEL_COUNT = 10;

const EMPTY_LEVELS = Array.from({ length: LEVEL_COUNT }, (_, i) => ({
  level: i + 1,
  id: "",
  levelBonus: "",
}));

const AdminIbZone = () => {
  const [formData, setFormData] = useState(EMPTY_LEVELS);
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  const [accountsTypes, setAccountsTypes] = useState<any[]>([]);
  const [currentAccount, setCurrentAccount] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);

  const configuredCount = useMemo(
    () =>
      formData.filter((r) => r.levelBonus !== "" && Number(r.levelBonus) > 0)
        .length,
    [formData]
  );

  const totalConfiguredValue = useMemo(
    () =>
      formData.reduce((sum, row) => {
        const value = Number(row.levelBonus || 0);
        return sum + (Number.isFinite(value) ? value : 0);
      }, 0),
    [formData]
  );

  const resetFormData = () => setFormData(EMPTY_LEVELS);

  const handleInputChange = (
    index: number,
    field: "levelBonus",
    value: string
  ) => {
    const updated = [...formData];
    updated[index][field] = value === "" ? "" : value;
    setFormData(updated);
  };

  const fetchAccountTypes = async () => {
    try {
      const res = await adminApi.get(`/get-custom-groups`);
      const types = res?.data?.data || [];
      setAccountsTypes(types);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load account types");
    }
  };

  const fetchIbs = async () => {
    if (!currentAccount?._id) return;

    setLoading(true);
    resetFormData();

    try {
      const res = await adminApi.get(`/admin-ibs`);
      const all = res?.data?.data || [];
      const filtered = all.filter(
        (v: any) => v.accountTypeId === currentAccount._id
      );

      if (filtered.length) {
        const updated = Array.from({ length: LEVEL_COUNT }, (_, idx) => {
          const level = idx + 1;
          const found = filtered.find(
            (ib: any) =>
              ib.level === level && ib.accountTypeId === currentAccount._id
          );

          return {
            level,
            id: found ? found._id : "",
            levelBonus: found ? String(found.commission ?? "") : "",
          };
        });

        setFormData(updated);
      } else {
        resetFormData();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load IB config");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index: number) => setEditingIndex(index);

  const handleSave = async (index: number) => {
    const row = formData[index];

    if (!currentAccount?._id) {
      toast.error("Please select an account type first.");
      return;
    }

    const numeric = row.levelBonus === "" ? NaN : Number(row.levelBonus);
    if (!Number.isFinite(numeric) || numeric < 0) {
      toast.error("Enter a valid non-negative number for Level Bonus.");
      return;
    }

    const toastId = toast.loading("Saving...");
    setSavingIdx(index);

    try {
      if (!row.id) {
        await adminApi.post(`/add-admin-ib`, {
          accountType: currentAccount.customGroup,
          accountTypeId: currentAccount._id,
          level: row.level,
          commission: Number(numeric),
        });
      } else {
        await adminApi.put(`/update-admin-ib/${row.id}`, {
          commission: Number(numeric),
        });
      }

      toast.success("Saved successfully", { id: toastId });
      setEditingIndex(-1);
      await fetchIbs();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Save failed", {
        id: toastId,
      });
    } finally {
      setSavingIdx(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(-1);
    fetchIbs();
  };

  useEffect(() => {
    fetchAccountTypes();
  }, []);

  useEffect(() => {
    if (accountsTypes?.length && !currentAccount) {
      setCurrentAccount(accountsTypes[0]);
    }
  }, [accountsTypes, currentAccount]);

  useEffect(() => {
    if (currentAccount?._id) fetchIbs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount?._id]);

  /* The row index is the level minus one, so a column cell can find its own
     place in `formData` without the table knowing about the edit state. */
  const columns = [
    {
      key: "level",
      header: "Level",
      primary: true,
      cell: (row: any) => (
        <span className="numeric font-semibold text-text">
          Level {row.level}
        </span>
      ),
    },
    {
      key: "state",
      header: "State",
      secondary: true,
      cell: (row: any) =>
        row.levelBonus !== "" && Number(row.levelBonus) > 0 ? (
          <Badge tone="success" dot={false}>
            Configured
          </Badge>
        ) : (
          <Badge tone="neutral" dot={false}>
            Not set
          </Badge>
        ),
    },
    {
      key: "levelBonus",
      header: "Commission per lot",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (row: any) => {
        const index = row.level - 1;

        if (editingIndex !== index) {
          return row.levelBonus === "" ? (
            <span className="text-subtle">—</span>
          ) : (
            <span className="font-semibold">
              {Number(row.levelBonus).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          );
        }

        return (
          <div className="flex justify-end">
            <Input
              autoFocus
              type="number"
              min="0"
              step="0.01"
              value={row.levelBonus}
              onChange={(e: any) =>
                handleInputChange(index, "levelBonus", e.target.value)
              }
              onKeyDown={(e: any) => {
                if (e.key === "Enter") handleSave(index);
                if (e.key === "Escape") handleCancel();
              }}
              aria-label={`Commission for level ${row.level}`}
              className="numeric w-[130px] text-right"
            />
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      cardFull: true,
      cell: (row: any) => {
        const index = row.level - 1;

        if (editingIndex === index) {
          return (
            <div className="flex justify-end gap-1.5">
              <Button
                size="sm"
                variant="success-soft"
                onClick={() => handleSave(index)}
                loading={savingIdx === index}
              >
                Save
              </Button>
              <Button size="sm" variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          );
        }

        return (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleEdit(index)}
              disabled={!currentAccount?._id || loading}
            >
              Edit
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <BlotterPage
      keyField="level"
      breadcrumb="Partners / IB zone"
      title="IB commission levels"
      description="Commission paid per lot at each referral level, per account type."
      actions={
        <>
          {/* The account type is what the page is about, not a filter, so it
              lives in the header where it is visible at every width —
              FilterBar's selects are hidden below `lg`. */}
          <div className="w-[190px]">
            <Select
              value={currentAccount?._id || ""}
              onChange={(e: any) =>
                setCurrentAccount(
                  accountsTypes.find((t: any) => t._id === e.target.value) ||
                    null
                )
              }
              aria-label="Account type"
            >
              <option value="">Select account type</option>
              {accountsTypes.map((t: any) => (
                <option key={t._id} value={t._id}>
                  {t.customGroup}
                </option>
              ))}
            </Select>
          </div>

          <Button
            variant="secondary"
            onClick={fetchIbs}
            loading={loading}
            disabled={!currentAccount?._id}
          >
            Reload
          </Button>
        </>
      }
      readouts={[
        {
          key: "account",
          label: "Account type",
          value: currentAccount?.customGroup || "None selected",
          helper: `${accountsTypes.length} types available`,
          tone: "brand",
        },
        {
          key: "configured",
          label: "Levels configured",
          value: `${configuredCount} / ${LEVEL_COUNT}`,
          tone: configuredCount === LEVEL_COUNT ? "ok" : "warn",
        },
        {
          key: "total",
          label: "Combined per lot",
          value: totalConfiguredValue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          helper: "Sum across all ten levels",
        },
      ]}
      columns={columns}
      rows={currentAccount?._id ? formData : []}
      loading={loading}
      rowEdge={(row: any) =>
        row.levelBonus === "" || Number(row.levelBonus) <= 0 ? "warning" : null
      }
      empty={
        <EmptyState
          title={
            accountsTypes.length
              ? "No account type selected"
              : "No account types"
          }
          description={
            accountsTypes.length
              ? "Pick an account type to set its commission levels."
              : "Create a custom group first, then set its IB levels here."
          }
          action={
            accountsTypes.length ? (
              <Button
                variant="soft"
                onClick={() => setCurrentAccount(accountsTypes[0])}
              >
                Use {accountsTypes[0]?.customGroup}
              </Button>
            ) : null
          }
        />
      }
    />
  );
};

export default AdminIbZone;
