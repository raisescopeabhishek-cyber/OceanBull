import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Palette,
  ToggleLeft,
  Loader2,
  ToggleRight,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const RulesManagement = () => {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({
    text: "",
    color: "#ffffff",
    status: true,
  });
  const [editingRule, setEditingRule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BECKEND_END_POINT}/api/auth/get-rules`
      );
      setRules(response.data.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to fetch data");
      setLoading(false);
      console.log(err);
      setRules([]);
    }
  };

  const handleAddRule = async () => {
    if (newRule.text === "") {
      toast("Text can't be empty", { icon: `⚠️` });
    } else if (newRule.text !== "") {
      setLoading(true);
      try {
        await axios.post(
          `${import.meta.env.VITE_BECKEND_END_POINT}/api/auth/add-rule`,
          {
            text: newRule.text,
            color: newRule.color,
            status: newRule.status,
          }
        );
        setNewRule({ text: "", color: "#ffffff", status: true });
        await fetchRules();
        setLoading(false);
        toast.success("New rule added");
      } catch (err) {
        console.log(err);
        toast.error("Something went wrong");
        setLoading(false);
      }
    }
  };

  const handleUpdateRule = async (id) => {
    try {
      setLoading(true);
      await axios.put(
        `${import.meta.env.VITE_BECKEND_END_POINT}/api/auth/update-rule`,
        {
          id: id,
          text: editingRule.text,
          color: editingRule.color,
          status: editingRule.status,
        }
      );
      setEditingRule(null);
      toast.success("Rule Updated");
      await fetchRules();
    } catch (err) {
      toast.error("Something Went Wrong!!");
      console.log(err);
      setLoading(false);
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      setLoading(true);
      await axios.delete(
        `${
          import.meta.env.VITE_BECKEND_END_POINT
        }/api/auth/delete-rule?id=${id}`
      );
      toast.success("Rule Deleted");
      await fetchRules();
    } catch (err) {
      console.log(err);
      toast.error("something went wrong!!");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-primary-900 to-gray-800">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-100 tracking-tight">
          Rules Management
        </h1>

        {/* Add New Rule Form */}
        <div className="bg-gray-800/40 rounded-xl shadow-lg border border-gray-700/30 p-4 md:p-6 mb-8 backdrop-blur-sm">
          <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-100 flex items-center gap-2">
            <PlusCircle className="h-5 w-5 md:h-6 md:w-6 text-gray-100" />
            <span>Add New Rule</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="col-span-1 md:col-span-2">
              <textarea
                rows="3"
                placeholder="Enter rule text"
                value={newRule.text}
                onChange={(e) => {
                  setNewRule({ ...newRule, text: e.target.value });
                  setFormErrors({ ...formErrors, text: "" });
                }}
                className={`w-full px-3 py-2 rounded-lg bg-primary-700 text-gray-100 border ${
                  formErrors.text ? "border-red-500" : "border-gray-600/30"
                } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200 resize-none`}
              />
              {formErrors.text && (
                <p className="mt-1 text-sm text-red-500">{formErrors.text}</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="color"
                    value={newRule.color}
                    onChange={(e) => {
                      setNewRule({ ...newRule, color: e.target.value });
                      setFormErrors({ ...formErrors, color: "" });
                    }}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2 bg-primary-700 px-3 py-2 rounded-lg">
                  <Palette className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-200 font-mono text-sm">
                    {newRule.color}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <select
                value={newRule.status}
                onChange={(e) => {
                  const selectedValue = e.target.value === "true";
                  setNewRule({ ...newRule, status: selectedValue });
                  setFormErrors({ ...formErrors, status: "" });
                }}
                className="w-full px-3 py-2 rounded-lg bg-primary-700 text-gray-100 border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAddRule}
            disabled={loading}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50 transition duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="h-4 w-4" />
            )}
            <span>Add Rule</span>
          </button>
        </div>

        {/* Rules List */}
        <div className="bg-gray-800/40 rounded-xl shadow-lg border border-gray-700/40 p-4 md:p-6 backdrop-blur-sm">
          <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-100">
            Existing Rules
          </h2>

          {loading && !rules?.length ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {rules?.map((rule) => (
                <div
                  key={rule._id}
                  className="border border-gray-700/40 rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-primary-700/90"
                >
                  {editingRule?.id === rule._id ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="md:col-span-3">
                        <textarea
                          rows="2"
                          value={editingRule?.text}
                          onChange={(e) =>
                            setEditingRule({
                              ...editingRule,
                              text: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-gray-700/30 text-gray-100 border border-gray-600/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={editingRule.color}
                          onChange={(e) =>
                            setEditingRule({
                              ...editingRule,
                              color: e.target.value,
                            })
                          }
                          className="w-20 h-8 rounded-lg cursor-pointer"
                        />
                        <span className="font-mono text-gray-200 text-sm">
                          {editingRule.color}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <select
                          value={editingRule.status}
                          onChange={(e) => {
                            const selectedValue = e.target.value === "true";
                            setEditingRule({
                              ...editingRule,
                              status: selectedValue,
                            });
                          }}
                          className="flex-1 px-3 py-2 rounded-lg bg-gray-700/10 text-gray-100 border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option className="  text-black" value="true">
                            Active
                          </option>
                          <option className=" text-black" value="false">
                            Inactive
                          </option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateRule(rule._id)}
                            className="p-2 text-green-500 hover:bg-green-500/20 rounded-full transition-colors"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setEditingRule(null)}
                            className="p-2 text-red-500 hover:bg-red-500/20 rounded-full transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="md:col-span-3">
                        <p className="text-gray-100 break-words whitespace-normal">
                          {rule.text}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full border border-gray-600"
                          style={{ backgroundColor: rule?.color }}
                        />
                        <span className="text-gray-200 font-mono text-sm">
                          {rule.color}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full text-sm font-medium ${
                          rule.status
                            ? "text-green-500 bg-green-500/20"
                            : "text-red-500 bg-red-500/20"
                        }`}
                      >
                        {rule.status ? (
                          <ToggleRight size={20} />
                        ) : (
                          <ToggleLeft size={20} />
                        )}
                        <span>{rule.status ? "Active" : "Inactive"}</span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            setEditingRule({ ...rule, id: rule._id })
                          }
                          className="p-2 text-blue-500 hover:bg-blue-500/20 rounded-full transition-colors"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this rule?"
                              )
                            ) {
                              handleDeleteRule(rule._id);
                            }
                          }}
                          className="p-2 text-red-500 hover:bg-red-500/20 rounded-full transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {!loading && rules?.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No rules found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RulesManagement;
