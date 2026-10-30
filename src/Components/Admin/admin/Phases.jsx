import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

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
  Select,
} from "@/Components/ui";

/**
 * Challenge phases.
 *
 * The entry archetype: the phase being written is one column of grouped
 * fields, the limits it will impose are restated in the summary rail, and the
 * existing phases are a table below. The same form does add and edit — the
 * submit label and the rail say which, so there is no separate edit screen to
 * fall out of sync.
 */

const API_BASE = `${import.meta.env.VITE_BECKEND_END_POINT}/api/auth`;

const EMPTY_FORM = {
  accountType: "",
  phase: "",
  maxProfit: "",
  maxDailyLoss: "",
  maxOverallLoss: "",
};

const pct = (value) => {
  if (value === "" || value === null || value === undefined) return "—";
  const num = Number(value);
  return Number.isFinite(num) ? `${num}%` : String(value);
};

export default function Phases() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const fetchdata = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/get-phases`);
      setEntries(res.data.data.reverse());
    } catch (error) {
      setEntries([]);
      toast.error("Failed to fetch data");
      console.log("error in phases--", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/get-custom-groups`);
      setGroups(res.data.data.reverse());
    } catch (error) {
      toast.error("Failed to fetch group data");
      console.log("error in phases--", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    const payload = {
      accountType: formData.accountType,
      phase: formData.phase,
      maxProfit: formData.maxProfit,
      maxDailyLoss: formData.maxDailyLoss,
      maxOverallLoss: formData.maxOverallLoss,
    };

    try {
      if (editId !== null) {
        await axios.put(`${API_BASE}/update-phase`, { id: editId, ...payload });
        setEditId(null);
        toast.success("Updated Phase");
      } else {
        await axios.post(`${API_BASE}/add-phase`, payload);
        toast.success("Phase Added");
      }

      setFormData(EMPTY_FORM);
      await fetchdata();
    } catch (error) {
      toast.error(editId !== null ? "Failed to update" : "Failed to add data");
      console.log("error in phases--", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      accountType: entry?.accountType || "",
      phase: entry?.phase || "",
      maxProfit: entry?.maxProfit ?? "",
      maxDailyLoss: entry?.maxDailyLoss ?? "",
      maxOverallLoss: entry?.maxOverallLoss ?? "",
    });
    setEditId(entry?._id);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this phase? Challenges already using it keep their own copy."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/delete-phase?id=${id}`);
      toast.success("Phase deleted");
      await fetchdata();
    } catch (error) {
      toast.error("Failed to delete data");
      console.log("error in phases--", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(EMPTY_FORM);
    setEditId(null);
  };

  useEffect(() => {
    fetchdata();
    fetchGroupData();
  }, []);

  const missing = useMemo(() => {
    const required = [
      ["accountType", "account type"],
      ["phase", "phase name"],
      ["maxProfit", "profit target"],
      ["maxDailyLoss", "max daily loss"],
      ["maxOverallLoss", "max overall loss"],
    ];

    return required
      .filter(([key]) => String(formData[key] ?? "").trim() === "")
      .map(([, label]) => label);
  }, [formData]);

  const columns = [
    {
      key: "accountType",
      header: "Account type",
      primary: true,
      cell: (entry) => entry?.accountType || "—",
    },
    {
      key: "phase",
      header: "Phase",
      secondary: true,
      cell: (entry) => (
        <Badge tone="primary" dot={false}>
          {entry?.phase || "—"}
        </Badge>
      ),
    },
    {
      key: "maxProfit",
      header: "Profit target",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (entry) => (
        <span className="font-semibold text-profit">
          {pct(entry?.maxProfit)}
        </span>
      ),
    },
    {
      key: "maxDailyLoss",
      header: "Max daily loss",
      align: "right",
      numeric: true,
      cell: (entry) => (
        <span className="text-loss">{pct(entry?.maxDailyLoss)}</span>
      ),
    },
    {
      key: "maxOverallLoss",
      header: "Max overall loss",
      align: "right",
      numeric: true,
      cell: (entry) => (
        <span className="text-loss">{pct(entry?.maxOverallLoss)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cardFull: true,
      cell: (entry) => (
        <div className="flex justify-end gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEdit(entry)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger-soft"
            onClick={() => handleDelete(entry._id)}
            disabled={loading}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const phasesTable = (
    <Card>
      <CardHeader
        title="Existing phases"
        subtitle={`${entries.length} configured across ${
          new Set(entries.map((e) => e?.accountType).filter(Boolean)).size
        } account types.`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchdata}
            loading={loading}
          >
            Refresh
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={entries}
        loading={loading}
        empty={
          <EmptyState
            title="No phases yet"
            description="Add the first phase using the form above."
          />
        }
      />
    </Card>
  );

  return (
    <FormPage
      breadcrumb="Challenges / Phases"
      title={editId ? "Edit phase" : "Add a phase"}
      description="The profit target and loss limits a challenge phase enforces."
      actions={
        editId ? (
          <Button variant="secondary" onClick={handleCancel}>
            Cancel edit
          </Button>
        ) : null
      }
      summary={{
        title: editId ? "Updating" : "Will create",
        rows: [
          { label: "Account type", value: formData.accountType || "—" },
          { label: "Phase", value: formData.phase || "—" },
          {
            label: "Profit target",
            value: pct(formData.maxProfit),
            tone: "profit",
          },
          {
            label: "Max daily loss",
            value: pct(formData.maxDailyLoss),
            tone: "loss",
          },
          {
            label: "Max overall loss",
            value: pct(formData.maxOverallLoss),
            tone: "loss",
            weight: "bold",
          },
        ],
      }}
      submit={{
        label: editId ? "Save phase" : "Add phase",
        onClick: handleSubmit,
        loading,
        disabled: missing.length > 0,
        reason: missing.length ? `Still needed: ${missing.join(", ")}` : undefined,
      }}
      below={phasesTable}
    >
      <SectionStep
        index={1}
        title="Which accounts"
        hint="The custom group this phase applies to."
      >
        <Field label="Account type" htmlFor="phase-account" required>
          <Select
            id="phase-account"
            name="accountType"
            value={formData.accountType}
            onChange={handleInputChange}
          >
            <option value="">Select account type</option>
            {groups.map((group) => (
              <option key={group._id} value={group.customGroup}>
                {group.customGroup}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Phase name"
          htmlFor="phase-name"
          required
          className="mt-3"
          hint="What the client sees, e.g. Phase 1 or Verification."
        >
          <Input
            id="phase-name"
            name="phase"
            value={formData.phase}
            onChange={handleInputChange}
            placeholder="Phase 1"
          />
        </Field>
      </SectionStep>

      <SectionStep
        index={2}
        title="Pass condition"
        hint="The profit needed to clear this phase."
      >
        <Field label="Profit target (%)" htmlFor="phase-profit" required>
          <Input
            id="phase-profit"
            name="maxProfit"
            type="number"
            step="0.01"
            value={formData.maxProfit}
            onChange={handleInputChange}
            placeholder="8"
            className="numeric"
          />
        </Field>
      </SectionStep>

      <SectionStep
        index={3}
        title="Breach limits"
        hint="Either limit being hit fails the challenge."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Max daily loss (%)" htmlFor="phase-daily" required>
            <Input
              id="phase-daily"
              name="maxDailyLoss"
              type="number"
              step="0.01"
              value={formData.maxDailyLoss}
              onChange={handleInputChange}
              placeholder="5"
              className="numeric"
            />
          </Field>

          <Field label="Max overall loss (%)" htmlFor="phase-overall" required>
            <Input
              id="phase-overall"
              name="maxOverallLoss"
              type="number"
              step="0.01"
              value={formData.maxOverallLoss}
              onChange={handleInputChange}
              placeholder="10"
              className="numeric"
            />
          </Field>
        </div>
      </SectionStep>
    </FormPage>
  );
}
