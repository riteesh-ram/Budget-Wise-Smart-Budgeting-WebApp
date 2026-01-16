import {useMemo} from "react";
import {addThousandsSeparator, prepareIncomeLineChartData} from "../util/util.js";
import CustomLineChart from "./CustomLineChart.jsx";
import {Plus} from "lucide-react";

const months = [
    "January","February","March","April","May","June","July","August","September","October","November","December"
];

const getYearAndMonth = (dateString) => {
    if (!dateString) return null;
    const normalized = typeof dateString === "string" ? dateString : String(dateString);
    // Accept YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss formats
    const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    if (Number.isNaN(year) || Number.isNaN(month) || month < 0 || month > 11) return null;
    return {year, month};
};

const IncomeOverview = ({
    transactions = [],
    filteredTransactions = [],
    selectedMonth,
    selectedYear,
    onMonthChange,
    onYearChange,
    onAddIncome,
}) => {
    const now = new Date();

    const availableYears = useMemo(() => {
        const years = new Set();
        for (let y = now.getFullYear() - 4; y <= now.getFullYear() + 1; y++) {
            years.add(y);
        }
        transactions.forEach((t) => {
            const parsed = getYearAndMonth(t.date);
            if (parsed) years.add(parsed.year);
        });
        return Array.from(years).sort((a, b) => a - b);
    }, [transactions]);

    const chartData = useMemo(
        () => prepareIncomeLineChartData(filteredTransactions || []),
        [filteredTransactions]
    );

    const totalAmount = useMemo(
        () => (filteredTransactions || []).reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [filteredTransactions]
    );

    return (
        <div className="card">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h5 className="text-lg">
                        Income Overview
                    </h5>
                    <p className="text-xs text-gray-400 mt-0 5">
                        Track your earnings over time and analyze your income trends.
                    </p>
                    <p className="text-sm font-semibold text-green-700 mt-2">
                        Total this month: ₹{addThousandsSeparator(totalAmount)}
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex gap-2">
                        <select
                            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
                            value={selectedMonth}
                            onChange={(e) => onMonthChange(Number(e.target.value))}
                        >
                            {months.map((label, idx) => (
                                <option key={label} value={idx}>{label}</option>
                            ))}
                        </select>
                        <select
                            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
                            value={selectedYear}
                            onChange={(e) => onYearChange(Number(e.target.value))}
                        >
                            {availableYears.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <button className="add-btn" onClick={onAddIncome}>
                        <Plus size={15} className="text-lg" /> Add Income
                    </button>
                </div>
            </div>
            <div className="mt-10">
                <CustomLineChart data={chartData} />
            </div>
        </div>
    )
}

export default IncomeOverview;