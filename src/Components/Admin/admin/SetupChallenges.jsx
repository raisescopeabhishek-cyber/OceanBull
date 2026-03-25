import { useState } from "react";
import { Edit, Power, RotateCcwSquareIcon, SwitchCamera } from "lucide-react";
import { Switch } from "../ui/Switch";
import AddNew from "../../Admin/setup-challenges/AddNew";
// import AddNew from "@/components/admin/setup-challenges/AddNew";


const SetupChallenges = () => {
  const [plans, setPlans] = useState([
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
  ]);

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

  return (
    <div className="container w-full p-10 mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Plans Funded</h2>
        <button
          className="text-white hover:text-primary-100 font-medium"
          onClick={() => setIsModalOpen(true)}
        >
          + Add New
        </button>
      </div>

      <div className="bg-primary-700 text-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-primary-500 text-white">
              <th className="px-6 py-3 text-left">Plan Name</th>
              <th className="px-6 py-3 text-left">Phase</th>
              <th className="px-6 py-3 text-left">Tree Commission</th>
              <th className="px-6 py-3 text-center">Is Default</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="border-b">
                <td className="px-6 py-4">{plan.name}</td>
                <td className="px-6 py-4">{plan.phase}</td>
                <td className="px-6 py-4">
                  {plan.treeCommission.toFixed(2)} USD
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <RotateCcwSquareIcon></RotateCcwSquareIcon>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      plan.status === "Enabled"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {plan.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-white hover:text-primary-100 mr-3">
                    <Edit size={18} />
                  </button>
                  <button
                    className={`${
                      plan.status === "Enabled"
                        ? "text-red-600 hover:text-red-900"
                        : "text-green-600 hover:text-green-900"
                    }`}
                    onClick={() => toggleStatus(plan.id)}
                  >
                    <Power size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddNew
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addPlan}
      />
    </div>
  );
};

export default SetupChallenges;
