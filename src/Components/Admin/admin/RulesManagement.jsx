import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { adminApi } from "../../../utils/apiClients";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  FormPage,
  Input,
  SectionStep,
  Skeleton,
  Textarea,
  Well,
} from "@/Components/ui";

/**
 * Trading rules.
 *
 * The entry archetype: one column of grouped fields for the rule being
 * written, a summary rail stating what exists today, and the live list
 * underneath. Editing happens in place on a row — a rule is one line of text
 * and a colour, so a modal would be more ceremony than the edit deserves.
 *
 * The colour is a swatch plus its hex, because the hex is what a developer
 * reading the client side will match against.
 */

const DEFAULT_COLOR = "#2a56dc";

const RulesManagement = () => {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({
    text: "",
    color: DEFAULT_COLOR,
    status: true,
  });
  const [editingRule, setEditingRule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const stats = useMemo(() => {
    const active = rules?.filter((rule) => Boolean(rule?.status))?.length || 0;
    const total = rules?.length || 0;

    return {
      total,
      active,
      inactive: total - active,
    };
  }, [rules]);

  const fetchRules = async () => {
    try {
      setLoading(true);

      const response = await adminApi.get("/get-rules");
      const data = response?.data?.data;

      setRules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch rules");
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async () => {
    const text = newRule.text.trim();

    if (!text) {
      setFormErrors({ text: "Rule text is required" });
      toast("Text can't be empty", { icon: "⚠️" });
      return;
    }

    try {
      setLoading(true);

      await adminApi.post("/add-rule", {
        text,
        color: newRule.color,
        status: newRule.status,
      });

      setNewRule({
        text: "",
        color: DEFAULT_COLOR,
        status: true,
      });
      setFormErrors({});

      toast.success("New rule added");
      await fetchRules();
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRule = async (id) => {
    const text = editingRule?.text?.trim();

    if (!text) {
      toast("Rule text can't be empty", { icon: "⚠️" });
      return;
    }

    try {
      setLoading(true);

      await adminApi.put("/update-rule", {
        id,
        text,
        color: editingRule.color,
        status: editingRule.status,
      });

      setEditingRule(null);
      toast.success("Rule updated");
      await fetchRules();
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this rule?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await adminApi.delete(`/delete-rule?id=${id}`);

      toast.success("Rule deleted");
      await fetchRules();
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /** Toggling live/paused is an update with only `status` changed. */
  const handleToggleStatus = async (rule) => {
    try {
      setLoading(true);

      await adminApi.put("/update-rule", {
        id: rule._id,
        text: rule.text,
        color: rule.color,
        status: !rule.status,
      });

      toast.success(rule.status ? "Rule paused" : "Rule is live");
      await fetchRules();
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const colorField = (value, onChange, idPrefix) => (
    <div className="flex items-center gap-2">
      <input
        id={`${idPrefix}-color`}
        type="color"
        value={value || DEFAULT_COLOR}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Rule colour"
        className="h-9 w-12 shrink-0 cursor-pointer rounded-field border border-line bg-surface p-0.5"
      />
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={DEFAULT_COLOR}
        aria-label="Rule colour hex"
        className="numeric"
      />
    </div>
  );

  const rulesList = (
    <Card>
      <CardHeader
        title="Live rules"
        subtitle="Shown to clients in the order they are returned."
        actions={
          <Button variant="secondary" size="sm" onClick={fetchRules} loading={loading}>
            Refresh
          </Button>
        }
      />

      <div className="p-3.5">
        {loading && !rules.length ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : !rules.length ? (
          <EmptyState
            title="No rules yet"
            description="Add the first rule using the form above."
          />
        ) : (
          <ul className="space-y-2">
            {rules.map((rule) => {
              const editing = editingRule?._id === rule._id;

              return (
                <li key={rule._id}>
                  <Well className="min-w-0">
                    {editing ? (
                      <div className="space-y-2.5">
                        <Field label="Rule text" htmlFor={`edit-${rule._id}`}>
                          <Textarea
                            id={`edit-${rule._id}`}
                            rows={3}
                            value={editingRule.text || ""}
                            onChange={(e) =>
                              setEditingRule((prev) => ({
                                ...prev,
                                text: e.target.value,
                              }))
                            }
                          />
                        </Field>

                        <Field label="Colour">
                          {colorField(
                            editingRule.color,
                            (color) =>
                              setEditingRule((prev) => ({ ...prev, color })),
                            `edit-${rule._id}`
                          )}
                        </Field>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateRule(rule._id)}
                            loading={loading}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingRule(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-1 h-4 w-4 shrink-0 rounded-full border border-line"
                          style={{ backgroundColor: rule.color || DEFAULT_COLOR }}
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-text">{rule.text}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <Badge
                              tone={rule.status ? "success" : "neutral"}
                              dot={false}
                            >
                              {rule.status ? "Live" : "Paused"}
                            </Badge>
                            <span className="numeric text-[11px] text-subtle">
                              {rule.color || DEFAULT_COLOR}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleToggleStatus(rule)}
                            disabled={loading}
                          >
                            {rule.status ? "Pause" : "Go live"}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingRule({ ...rule })}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger-soft"
                            onClick={() => handleDeleteRule(rule._id)}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </Well>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );

  return (
    <FormPage
      breadcrumb="Configuration / Rules"
      title="Trading rules"
      description="The rules clients see, their colour and whether each one is live."
      summary={{
        title: "Current state",
        rows: [
          { label: "Total rules", value: stats.total },
          { label: "Live", value: stats.active, tone: "profit" },
          { label: "Paused", value: stats.inactive, tone: "muted" },
        ],
      }}
      submit={{
        label: "Add rule",
        onClick: handleAddRule,
        loading,
        disabled: !newRule.text.trim(),
        reason: newRule.text.trim() ? undefined : "Write the rule text first",
      }}
      below={rulesList}
    >
      <SectionStep index={1} title="Rule text" hint="What the client is told.">
        <Field
          htmlFor="new-rule-text"
          error={formErrors.text}
          hint="Plain sentences work best — this is read, not parsed."
        >
          <Textarea
            id="new-rule-text"
            rows={4}
            value={newRule.text}
            onChange={(e) => {
              setNewRule((prev) => ({ ...prev, text: e.target.value }));
              if (formErrors.text) setFormErrors({});
            }}
            placeholder="e.g. Maximum daily loss is 5% of the starting balance."
          />
        </Field>
      </SectionStep>

      <SectionStep
        index={2}
        title="Appearance"
        hint="The colour the rule is shown in."
      >
        <Field label="Colour">
          {colorField(
            newRule.color,
            (color) => setNewRule((prev) => ({ ...prev, color })),
            "new-rule"
          )}
        </Field>
      </SectionStep>

      <SectionStep
        index={3}
        title="Visibility"
        hint="A paused rule is kept but not shown."
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant={newRule.status ? "primary" : "secondary"}
            onClick={() => setNewRule((prev) => ({ ...prev, status: true }))}
          >
            Live on add
          </Button>
          <Button
            variant={!newRule.status ? "primary" : "secondary"}
            onClick={() => setNewRule((prev) => ({ ...prev, status: false }))}
          >
            Add paused
          </Button>
        </div>
      </SectionStep>
    </FormPage>
  );
};

export default RulesManagement;
