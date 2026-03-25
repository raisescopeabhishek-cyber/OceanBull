import React from "react";

export default function UserReferralPendingDeposit() {
  // Sample data - replace with your actual data
  const pendingDeposits = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      country: "United States",
      timestamp: "2025-10-28 14:30:25",
      amount: "$1,500.00",
      status: "Pending",
    },
    {
      id: 2,
      name: "Sarah Smith",
      email: "sarah@example.com",
      country: "Canada",
      timestamp: "2025-10-28 13:45:12",
      amount: "$2,300.00",
      status: "Processing",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      country: "Australia",
      timestamp: "2025-10-28 12:15:45",
      amount: "$800.00",
      status: "Pending",
    },
  ];

  return (
    <div className=" max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Pending Deposits</h2>
        <p className="text-gray-400 mt-1">
          Track all pending deposit from users
        </p>
      </div>

      <div className="bg-secondary-800 rounded-lg shadow-lg overflow-hidden">
        <div className="min-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-secondary-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Name/Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-secondary-800/10 divide-y divide-gray-200">
              {pendingDeposits.map((deposit) => (
                <tr
                  key={deposit.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-100">
                        {deposit.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {deposit.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {deposit.country}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {deposit.amount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        deposit.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {deposit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {deposit.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
