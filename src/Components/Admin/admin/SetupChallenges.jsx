import { useState } from "react";

import AddNew from "../../Admin/setup-challenges/AddNew";
import { Badge, BlotterPage, Button, Card, EmptyState } from "@/Components/ui";

/**
 * Challenge plan setup.
 *
 * NOTE: this screen is not wired to the API. `plans` below is seeded in
 * component state, so toggling default or status changes nothing on the
 * server and is lost on reload. The banner says so, rather than letting the
 * page look authoritative. The layout is the real blotter, so connecting it
 * is a matter of replacing this state with a fetch.
 */

const SEED_PLANS = [
  {
    id: 1,
    name: "TWO STEP EVALUATION (phase 2)",
    phase: 2,
    treeCommission: 5.0,
    isDefault: true,
    status: "Enabled",
  },
  {
    id: 2,
    name: "Funded Live (one Step)",
    phase: 1,
    treeCommission: 0.0,
    isDefault: false,
    status: "Disabled",
  },
  {
    id: 3,
    name: "ONE STEP EVALUATION",
    phase: 1,
    treeCommission: 12.0,
    isDefault: false,
    status: "Disabled",
  },
  {
    id: 4,
    name: "TWO STEP EVALUATION (phase 1)",
    phase: 2,
    treeCommission: 8.0,
    isDefault: false,
    status: "Enabled",
  },
  {
    id: 5,
    name: "FUNDED (Live)",
    phase: 1,
    treeCommission: 0.0,
    isDefault: true,
    status: "Enabled",
  },
];

const SetupChallenges = () => {
  const [plans, setPlans] = useState(SEED_PLANS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleDefault = (id) => {
    setPlans(
      plans.map((plan) => ({
        ...plan,
        isDefault: plan.id === id ? !plan.isDefault : plan.isDefault,
      }))
    );
  };

  const toggleStatus = (id) => {
    setPlans(
      plans.map((plan) => ({
        ...plan,
        status:
          plan.id === id
            ? plan.status === "Enabled"
              ? "Disabled"
              : "Enabled"
            : plan.status,
      }))
    );
  };

  const addPlan = (newPlan) => {
    setPlans([...plans, { ...newPlan, id: plans.length + 1 }]);
  };

  const enabledCount = plans.filter((p) => p.status === "Enabled").length;
  const defaultCount = plans.filter((p) => p.isDefault).length;

  const columns = [
    {
      key: "name",
      header: "Plan",
      primary: true,
      cell: (plan) => (
        <div className="min-w-0">
          <div className="truncate font-semibold text-text">{plan.name}</div>
          {plan.isDefault ? (
            <div className="mt-0.5">
              <Badge tone="primary" dot={false}>
                Default
              </Badge>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "phase",
      header: "Phases",
      secondary: true,
      numeric: true,
      cell: (plan) => `${plan.phase} step`,
    },
    {
      key: "treeCommission",
      header: "Tree commission",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (plan) => (
        <span className="font-semibold">
          {Number(plan.treeCommission || 0).toFixed(2)}%
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (plan) => (
        <Badge
          tone={plan.status === "Enabled" ? "success" : "neutral"}
          dot={false}
        >
          {plan.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cardFull: true,
      cell: (plan) => (
        <div className="flex justify-end gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => toggleDefault(plan.id)}
          >
            {plan.isDefault ? "Unset default" : "Set default"}
          </Button>
          <Button
            size="sm"
            variant={plan.status === "Enabled" ? "danger-soft" : "success-soft"}
            onClick={() => toggleStatus(plan.id)}
          >
            {plan.status === "Enabled" ? "Disable" : "Enable"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <BlotterPage
        keyField="id"
        breadcrumb="Challenges / Plans"
        title="Challenge plans"
        description="Evaluation and funded plans, their phase count and tree commission."
        actions={
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Add plan
          </Button>
        }
        readouts={[
          {
            key: "total",
            label: "Plans",
            value: plans.length,
            tone: "brand",
          },
          {
            key: "enabled",
            label: "Enabled",
            value: `${enabledCount} / ${plans.length}`,
            tone: enabledCount ? "ok" : "warn",
          },
          {
            key: "default",
            label: "Marked default",
            value: defaultCount,
            helper: defaultCount > 1 ? "More than one default" : undefined,
            tone: defaultCount > 1 ? "warn" : undefined,
          },
        ]}
        columns={columns}
        rows={plans}
        rowEdge={(plan) => (plan.isDefault ? "primary" : null)}
        empty={
          <EmptyState
            title="No plans"
            description="Add a plan to get started."
          />
        }
      >
        <Card className="mb-2 border-warning/40 bg-warning-soft px-3 py-2">
          <p className="text-xs font-medium text-warning">
            Demo data — this screen is not connected to the API yet. Changes
            here are not saved and are lost on reload.
          </p>
        </Card>
      </BlotterPage>

      <AddNew
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addPlan}
      />
    </>
  );
};

export default SetupChallenges;
