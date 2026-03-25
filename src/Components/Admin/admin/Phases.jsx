import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Save, X, Loader2Icon } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../Loader/Loader";
import { animate } from "framer-motion";

export default function Phases() {
  console.log("Chalaaaaaaaaaaaaaaaaaaaa");
  
  const [formData, setFormData] = useState({
    accountType: "",
    phase: "",
    maxProfit: "",
    maxDailyLoss: "",
    maxOverallLoss: "",
  });
  console.log("from data ---", formData);

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

  //   fetch phase data ----------------

  const fetchdata = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BECKEND_END_POINT}/api/auth/get-phases`
      );
      setEntries(res.data.data.reverse());
      setLoading(false);

      console.log(" get res--", res.data);
    } catch (error) {
      setEntries([]);
      setLoading(false);
      toast.error("Failed to fetch data");

      console.log("error in phases--", error);
    }
  };
  //   fetch group data ----------------

  const fetchGroupData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BECKEND_END_POINT}/api/auth/get-custom-groups`
      );
      setGroups(res.data.data.reverse());
      setLoading(false);

      console.log(" get group res--", res.data);
    } catch (error) {
      setEntries([]);
      setLoading(false);
      toast.error("Failed to fetch group data");

      console.log("error in phases--", error);
    }
  };
  //   add and update phase ----------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // update---------------
      if (editId !== null) {
        const res = await axios.put(
          `${import.meta.env.VITE_BECKEND_END_POINT}/api/auth/update-phase`,
          {
            id: editId,
            accountType: formData.accountType,
            phase: formData.phase,
            maxProfit: formData.maxProfit,
            maxDailyLoss: formData.maxDailyLoss,
            maxOverallLoss: formData.maxOverallLoss,
          }
        );
        setEditId(null);
        setLoading(false);
        toast.success("Updated Phase");
        setFormData({
          accountType: "",
          maxProfit: "",
          maxDailyLoss: "",
          maxOverallLoss: "",
          phase: "",
        });
        await fetchdata();
      }
      //   add ------------------
      else {
        const res = await axios.post(
          `${import.meta.env.VITE_BECKEND_END_POINT}/api/auth/add-phase`,
          {
            accountType: formData.accountType,
            phase: formData.phase,
            maxProfit: formData.maxProfit,
            maxDailyLoss: formData.maxDailyLoss,
            maxOverallLoss: formData.maxOverallLoss,
          }
        );
        setLoading(false);
        toast.success("Phase Added");
        await fetchdata();
        setFormData({
          accountType: "",
          maxProfit: "",
          maxDailyLoss: "",
          maxOverallLoss: "",
          phase: "",
        });

        console.log(" add res--", res.data);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Failed to add data");
      console.log("error in phases--", error);
    }
  };

  //   show edit value  phase ------------

  const handleEdit = async (entry) => {
    setFormData(entry);
    setEditId(entry?._id);
  };

  //   delete phase -------------------

  const handleDelete = async (id) => {
    // API call would go here
    setLoading(true);
    try {
      const res = await axios.delete(
        `${
          import.meta.env.VITE_BECKEND_END_POINT
        }/api/auth/delete-phase?id=${id}`
      );
      setLoading(false);
      toast.success("Phase deleted");
      await fetchdata();
      console.log(" delete res--", res.data);
      //   setEntries(entries.filter((entry) => entry._id !== id));
    } catch (error) {
      setLoading(false);
      toast.error("Failed to delete data");
      console.log("error in phases--", error);
    }
    console.log(entries);
  };

  const handleCancel = () => {
    setFormData({
      maxProfit: "",
      maxDailyLoss: "",
      maxOverallLoss: "",
      phase: "",
    });
    setEditId(null);
  };
  useEffect(() => {
    fetchdata();
    fetchGroupData();
    // setFormData({ accountType: groups[0]?.customGroup || [] });
  }, []);

  return (
    <div className="min-h-screen bg-primary-800 p-4">
      <h1 className=" text-white mb-4 text-3xl md:text-4xl font-bold ">
        Phase Management
      </h1>
      <div className="max-w-7xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-primary-700/60 rounded-lg p-6 mb-8 shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Account Type
              </label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleInputChange}
                className="w-full bg-primary-700 border border-primary-500 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none cursor-pointer"
                style={{
                  WebkitAppearance: "none",
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "1rem",
                }}
              >
                <option value="" disabled>
                  Select Accout Type
                </option>
                {groups?.map((value) => (
                  <option
                    key={value?._id}
                    value={value?.customGroup}
                    className="bg-primary-700 text-gray-100"
                  >
                    {value?.customGroup}{" "}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Phase
              </label>
              <input
                type="number"
                name="phase"
                value={formData.phase}
                onChange={handleInputChange}
                className="w-full bg-primary-700 border border-primary-500 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                placeholder="Enter Phase"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Profit Target
              </label>
              <div className="relative">
                <input
                  type="text" // Changed to text to allow "∞" symbol
                  name="maxProfit"
                  value={
                    formData.maxProfit === Infinity ? "∞" : formData.maxProfit
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    const newValue = value === "∞" ? Infinity : Number(value);
                    handleInputChange({
                      target: {
                        name: "maxProfit",
                        value: newValue,
                      },
                    });
                  }}
                  className="w-full bg-primary-700 border border-primary-500 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  placeholder="Enter profit target or ∞"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange({
                      target: {
                        name: "maxProfit",
                        value: formData.maxProfit === Infinity ? "" : Infinity,
                      },
                    })
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-primary-600 text-gray-400 hover:text-gray-200 transition-all duration-200"
                >
                  <span className="text-lg">∞</span>
                </button>
              </div>
              {/* Optional helper text */}
              <p className="text-xs text-gray-400 mt-1">
                Click ∞ for unlimited
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Maximum Daily Loss
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="maxDailyLoss"
                  value={
                    formData.maxDailyLoss === Infinity
                      ? "∞"
                      : formData.maxDailyLoss
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    const newValue = value === "∞" ? Infinity : Number(value);
                    handleInputChange({
                      target: {
                        name: "maxDailyLoss",
                        value: newValue,
                      },
                    });
                  }}
                  className="w-full bg-primary-700 border border-primary-500 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  placeholder="Enter max daily loss or ∞"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange({
                      target: {
                        name: "maxDailyLoss",
                        value:
                          formData.maxDailyLoss === Infinity ? "" : Infinity,
                      },
                    })
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-primary-600 text-gray-400 hover:text-gray-200 transition-all duration-200"
                >
                  <span className="text-lg">∞</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Click ∞ for unlimited
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Maximum Overall Loss
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="maxOverallLoss"
                  value={
                    formData.maxOverallLoss === Infinity
                      ? "∞"
                      : formData.maxOverallLoss
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    const newValue = value === "∞" ? Infinity : Number(value);
                    handleInputChange({
                      target: {
                        name: "maxOverallLoss",
                        value: newValue,
                      },
                    });
                  }}
                  className="w-full bg-primary-700 border border-primary-500 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  placeholder="Enter max overall loss or ∞"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange({
                      target: {
                        name: "maxOverallLoss",
                        value:
                          formData.maxOverallLoss === Infinity ? "" : Infinity,
                      },
                    })
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-primary-600 text-gray-400 hover:text-gray-200 transition-all duration-200"
                >
                  <span className="text-lg">∞</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Click ∞ for unlimited
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            {editId !== null && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gray-600/50 text-gray-300 rounded-lg hover:bg-gray-600/80 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editId !== null ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Phase
                  {loading && (
                    <Loader2Icon
                      className={` mx-2 animate-spin `}
                    ></Loader2Icon>
                  )}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Phase
                  {loading && (
                    <Loader2Icon
                      className={` mx-2 animate-spin `}
                    ></Loader2Icon>
                  )}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="bg-primary-700/60 overflow-x-scroll md:overflow-hidden rounded-lg shadow-xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                  Account Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                  Phase
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                  Profit Target
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                  Max Daily Loss
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                  Max Overall Loss
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {entries?.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-700 last:border-b-0"
                >
                  <td className="px-6 py-4 text-gray-300">
                    {entry?.accountType}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{entry?.phase}</td>
                  <td className="px-6 py-4 text-gray-300">
                    {entry?.maxProfit === 0 ? "Infinity" : entry?.maxProfit}%
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {entry?.maxDailyLoss}%
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {entry?.maxOverallLoss}%
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-1.5 rounded-full hover:bg-blue-500/10 text-blue-500 hover:text-blue-400 transition-all duration-200 border border-gray-700 hover:border-blue-500/50"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this entry?"
                            )
                          ) {
                            handleDelete(entry?._id);
                          }
                        }}
                        className="p-1.5 rounded-full  hover:bg-red-500/10 text-red-500 hover:text-red-400 transition-all duration-200 border border-gray-700 hover:border-red-500/50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              )}
              {entries.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No entries found. Add your first entry above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
