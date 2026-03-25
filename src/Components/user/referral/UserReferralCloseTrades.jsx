import { useEffect, useState, useRef } from "react";
import { ArrowLeft, CheckCheck, Info, RefreshCw, X } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaFileCsv } from "react-icons/fa";
import { GrDocumentPdf } from "react-icons/gr";
import { RiFileExcel2Line } from "react-icons/ri";
import { PiFileCsvDuotone } from "react-icons/pi";
import ModernHeading from "../../lib/ModernHeading";
import { backendApi } from "../../../utils/apiClients";
import DynamicLoder from "../../Loader/DynamicLoder";


const UserReferralCloseTrades = () => {
  const [commissionsData, setCommissionsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const tableRef = useRef(null);
  const [searchParams] = useSearchParams();
  const level = searchParams.get("level");

  // Calculate totals
  const totals = commissionsData.reduce(
    (acc, curr) => ({
      profit: acc.profit + Number(curr.profit || 0),
      lotSize: acc.lotSize + Number(curr.lotSize || 0),
      rebate: acc.rebate + Number(curr.commission.commissionAmount || 0),
    }),
    { profit: 0, lotSize: 0, rebate: 0 }
  );

  const prepareExportData = () => {
    const data = commissionsData.map((row) => ({
      "Account No": row.mt5Account,
      "Open Time": row.openTime,
      "Close Time": row.closeTime,
      "Open Price": row.openPrice,
      "Close Price": row.closePrice,
      Symbol: row.symbol,
      Profit: Number(row.profit).toFixed(4),
      Volume: Number(row.lotSize).toFixed(4),
      Rebate: Number(row.commission.commissionAmount).toFixed(4),
      Status: row.isCalculated ? "Completed" : "Pending",
    }));

    // Add totals row
    data.push({
      "Account No": "TOTAL",
      "Open Time": "",
      "Close Time": "",
      "Open Price": "",
      "Close Price": "",
      Symbol: "",
      Profit: totals.profit.toFixed(4),
      Volume: totals.lotSize.toFixed(4),
      Rebate: totals.rebate.toFixed(4),
      Status: "",
    });

    return data;
  };

  const exportToExcel = () => {
    const data = prepareExportData();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Commission Trades");

    // Auto-size columns
    const colWidths = Object.keys(data[0]).map((key) => ({
      wch: Math.max(key.length, ...data.map((row) => String(row[key]).length)),
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, "commission_trades.xlsx");
  };

  const exportToCSV = () => {
    const data = prepareExportData();
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "commission_trades.csv";
    link.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF("l", "pt");

    // Add title
    doc.setFontSize(16);
    doc.text("Commission Trades Report", 40, 40);

    // Prepare table data
    const data = prepareExportData();
    const headers = Object.keys(data[0]);
    const rows = data.map((obj) => Object.values(obj));

    // Add table
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 60,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: 255,
        fontSize: 9,
        fontStyle: "bold",
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: 0,
        fontSize: 9,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    doc.save("commission_trades.pdf");
  };

  const fetchCommissions = async () => {
    setIsLoading(true);
    try {
      const res = await backendApi.get(`/user-ib-close-trade/${id}`);
      const commissionsRes = res.data.data.reverse();
      const filteredCommissions = commissionsRes
        .map((trade) => ({
          ...trade,
          commission:
            trade.commissions.find(
              (commission) => commission.level === Number(level)
            ) || null,
        }))
        .filter((trade) => trade.commission !== null); // Remove trades without matching commission
      setCommissionsData(filteredCommissions);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  return (
    <div className=" m-[-10px] p-6 bg-secondary-800/20 rounded-lg shadow-lg overflow-x-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {/* Back Button */}
          <button
            onClick={() => {
              window.history.back();
            }}
            className="flex items-center mt-2 gap-2 rounded-xl border-b px-5 py-1 hover:px-6 border-secondary-500 text-secondary-500  transition-all"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          {/* Heading */}
          <div className="text-3xl font-bold">
            <ModernHeading text={"Commission Trades"}></ModernHeading>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 md:gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 text-gray-200 rounded-lg hover:text-secondary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            disabled={isLoading || commissionsData.length === 0}
          >
            <RiFileExcel2Line className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 text-gray-200 rounded-lg hover:text-secondary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            disabled={isLoading || commissionsData.length === 0}
          >
            <PiFileCsvDuotone className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 text-gray-200 rounded-lg hover:text-secondary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            disabled={isLoading || commissionsData.length === 0}
          >
            <GrDocumentPdf className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            onClick={fetchCommissions}
            className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 text-gray-200 rounded-lg hover:text-secondary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 md:w-5 md:h-5 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
            <span className="hidden sm:inline">
              {isLoading ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </div>
      </div>

      <div ref={tableRef}>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <DynamicLoder></DynamicLoder>
          </div>
        ) : (
          <table className="w-full whitespace-nowrap border-collapse min-w-[640px]">
            <thead className="rounded-md overflow-hidden">
              <tr className="bg-secondary-500-20">
                <th className="p-3 sm:p-4 whitespace-nowrap text-center text-sm sm:text-base">
                  AC NO
                </th>
                <th className="p-3 whitespace-nowrap sm:p-4 text-center text-sm sm:text-base">
                  Open Time
                </th>
                <th className="p-3 whitespace-nowrap sm:p-4 text-center text-sm sm:text-base">
                  Close Time
                </th>
                <th className="p-3 whitespace-nowrap sm:p-4 text-center text-sm sm:text-base">
                  Open Price
                </th>
                <th className="p-3 whitespace-nowrap sm:p-4 text-center text-sm sm:text-base">
                  Close Price
                </th>
                <th className="p-3 whitespace-nowrap sm:p-4 text-center text-sm sm:text-base">
                  Symbol
                </th>
                <th className="p-3 whitespace-nowrap sm:p-4 text-center text-sm sm:text-base">
                  Profit
                </th>
                <th className="p-3 whitespace-nowrap sm:p-4 text-center text-sm sm:text-base">
                  Volume
                </th>
                <th className="p-3 whitespace-nowrap sm:p-4 text-center text-sm sm:text-base">
                  Rebate
                </th>
                <th className="p-3 whitespace-nowrap sm:p-4 text-center text-sm sm:text-base">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {commissionsData.length === 0 && (
                <tr className="text-red-500 border-b border-secondary-800 hover:bg-secondary-500-10">
                  <td className="text-center align-middle py-6" colSpan="10">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                      <Info />
                      <p>No data found</p>
                    </div>
                  </td>
                </tr>
              )}
              {commissionsData?.map((value) => (
                <tr
                  key={value._id}
                  className="text-gray-200 border-b border-secondary-800 hover:bg-secondary-500-10"
                >
                  <td className="text-sm text-center py-2 sm:text-base">
                    {value?.mt5Account}
                  </td>
                  <td className="text-center text-sm sm:text-base">
                    {value?.openTime} <span className=" lg:hidden"> || </span>
                  </td>
                  <td className="text-center text-sm sm:text-base">
                    {value?.closeTime}
                  </td>
                  <td className="text-center text-sm sm:text-base">
                    {Number(value?.openPrice).toFixed(4)}
                  </td>
                  <td className="text-center text-sm sm:text-base">
                    {Number(value?.closePrice).toFixed(4)}
                  </td>
                  <td className="text-center text-sm sm:text-base">
                    {value?.symbol}
                  </td>
                  <td className="text-center text-sm sm:text-base">
                    {Number(value?.profit).toFixed(4)}
                  </td>
                  <td className="text-center text-sm sm:text-base">
                    {value?.lotSize?.toFixed(4)}
                  </td>
                  <td className="text-center text-sm sm:text-base">
                    {Number(value?.commission.commissionAmount).toFixed(4)}
                  </td>
                  <td className="text-center text-sm sm:text-base">
                    <div className="flex flex-col justify-center items-center">
                      {value?.commission.isCalculated === true ? (
                        <div className="text-green-500">
                          <CheckCheck />
                        </div>
                      ) : (
                        <div className="text-red-500">
                          <X />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {commissionsData.length > 0 && (
              <tfoot>
                <tr className="font-semibold bg-secondary-500-10">
                  <td
                    colSpan="6"
                    className="p-3 text-right text-sm sm:text-base"
                  >
                    Total:
                  </td>
                  <td className="p-3 text-center text-sm sm:text-base">
                    {totals?.profit?.toFixed(4)}
                  </td>
                  <td className="p-3 text-center text-sm sm:text-base">
                    {totals?.lotSize?.toFixed(4)}
                  </td>
                  <td className="p-3 text-center text-sm sm:text-base">
                    {totals?.rebate?.toFixed(4)}
                  </td>
                  <td className="p-3 text-center text-sm sm:text-base"></td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  );
};

export default UserReferralCloseTrades;
