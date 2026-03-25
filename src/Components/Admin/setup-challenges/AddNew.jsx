import { useState, useRef, useEffect } from "react";
import { Switch } from "../../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogOverlay,
} from "../../ui/dialog";

const AddNew = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [phase, setPhase] = useState(1);
  const [treeCommission, setTreeCommission] = useState(0);
  const [isDefault, setIsDefault] = useState(false);
  const [status, setStatus] = useState("Enabled");

  const dialogRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, phase, treeCommission, isDefault, status });
    onClose();
  };

  const handleClickOutside = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      <DialogContent
        className="fixed inset-0 flex items-center justify-center p-4"
        ref={dialogRef}
      >
        <div className="bg-white rounded-lg p-6 shadow-xl">
          <DialogTitle className="text-2xl font-bold mb-4">
            Add New Plan
          </DialogTitle>
          <DialogDescription>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Phase
                </label>
                <input
                  type="number"
                  value={phase}
                  onChange={(e) => setPhase(Number(e.target.value))}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Tree Commission
                </label>
                <input
                  type="number"
                  value={treeCommission}
                  onChange={(e) => setTreeCommission(Number(e.target.value))}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Is Default
                </label>
                <Switch
                  checked={isDefault}
                  onCheckedChange={() => setIsDefault(!isDefault)}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="submit"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-500 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddNew;
