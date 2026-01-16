import {Download, LoaderCircle, Mail, Folder} from "lucide-react";
import TransactionInfoCard from "./TransactionInfoCard.jsx";
import moment from "moment";
import {useState, useMemo} from "react";
import {addThousandsSeparator} from "../util/util.js";

const ExpenseList = ({transactions, onDelete, onDownload, onEmail}) => {
    const [loading, setLoading] = useState(false);

    const handleEmail = async () => {
        setLoading(true);
        try {
            await onEmail();
        } finally {
            setLoading(false);
        }
    }

    const handleDownload = async () => {
        setLoading(true);
        try {
            await onDownload();
        } finally {
            setLoading(false);
        }
    }

    // Group transactions by category name
    const groupedTransactions = useMemo(() => {
        const groups = {};
        transactions.forEach((item) => {
            const category = item.categoryName || "Uncategorized";
            if (!groups[category]) {
                groups[category] = {
                    items: [],
                    total: 0
                };
            }
            groups[category].items.push(item);
            groups[category].total += Number(item.amount);
        });
        return groups;
    }, [transactions]);

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <h5 className="text-lg font-semibold text-gray-800">All Expenses</h5>
                <div className="flex items-center justify-end gap-2">
                    <button disabled={loading} className="card-btn" onClick={handleEmail}>
                        {loading ? (
                            <>
                                <LoaderCircle className="w-4 h-4 animate-spin"/>
                                Emailing...
                            </>
                        ) : (
                            <>
                                <Mail size={15} className="text-base"/>
                                Email
                            </>
                        )}
                    </button>
                    <button disabled={loading} className="card-btn" onClick={handleDownload}>
                        {loading ? (
                            <>
                                <LoaderCircle className="w-4 h-4 animate-spin"/>
                                Downloading...
                            </>
                        ) : (
                            <>
                                <Download size={15} className="text-base"/>
                                Download
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Check if no transactions */}
            {transactions.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <p>No expense records found for this month.</p>
                </div>
            )}

            {/* Render Groups */}
            <div className="flex flex-col gap-6">
                {Object.keys(groupedTransactions).map((category) => (
                    <div key={category} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        
                        {/* Category Header */}
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div className="flex items-center gap-2 text-red-600">
                                <Folder size={18} />
                                <h6 className="font-medium text-base">{category}</h6>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {groupedTransactions[category].items.length}
                                </span>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                                Total: ₹{addThousandsSeparator(groupedTransactions[category].total)}
                            </span>
                        </div>

                        {/* Transactions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {groupedTransactions[category].items.map((expense) => (
                                <TransactionInfoCard
                                    key={expense.id}
                                    title={expense.name}
                                    icon={expense.icon}
                                    date={moment(expense.date).format('Do MMM YYYY')}
                                    amount={expense.amount}
                                    type="expense"
                                    onDelete={() => onDelete(expense.id)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ExpenseList;