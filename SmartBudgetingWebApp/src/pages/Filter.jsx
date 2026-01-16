import Dashboard from "../components/Dashboard.jsx";
import {useUser} from "../hooks/useUser.jsx";
import {Search} from "lucide-react";
import {useEffect, useState} from "react";
import axiosConfig from "../util/axiosConfig.jsx";
import {API_ENDPOINTS} from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import TransactionInfoCard from "../components/TransactionInfoCard.jsx";
import moment from "moment";

const Filter = () => {
    useUser();
    const [type, setType] = useState("income");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [keyword, setKeyword] = useState("");
    const [sortField, setSortField] = useState("date");
    const [sortOrder, setSortOrder] = useState("asc");
    
    // NEW: Category State
    const [categoryId, setCategoryId] = useState(""); 
    const [categories, setCategories] = useState([]);

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    // NEW: Fetch categories when 'type' changes
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Assuming you have an endpoint like /api/v1.0/categories/income or /expense
                const response = await axiosConfig.get(API_ENDPOINTS.CATEGORY_BY_TYPE(type));
                if (response.status === 200) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };

        // Reset selected category when type changes
        setCategoryId(""); 
        fetchCategories();
    }, [type]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosConfig.post(API_ENDPOINTS.APPLY_FILTERS, {
                type,
                startDate: startDate || null,
                endDate: endDate || null,
                keyword,
                sortField,
                sortOrder,
                // NEW: Send category ID (send null if empty string)
                categoryId: categoryId || null 
            });
            console.log('transactions: ', response.data);
            setTransactions(response.data);
        } catch (error) {
            console.error('Failed to fetch transactions: ', error);
            toast.error(error.message || "Failed to fetch transactions. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dashboard activeMenu="Filters">
            <div className="my-5 mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Filter Transactions</h2>
                </div>
                <div className="card p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-semibold">Select the filters</h5>
                    </div>
                    
                    {/* Updated Grid for inputs */}
                    <form className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="type">Type</label>
                            <select value={type} id="type" className="w-full border rounded px-3 py-2" onChange={e => setType(e.target.value)}>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        
                        {/* NEW: Category Dropdown */}
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="category">Category</label>
                            <select 
                                value={categoryId} 
                                id="category" 
                                className="w-full border rounded px-3 py-2" 
                                onChange={e => setCategoryId(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="startdate" className="block text-sm font-medium mb-1">Start Date</label>
                            <input value={startDate} id="startdate" type="date" className="w-full border rounded px-3 py-2" onChange={e => setStartDate(e.target.value)}/>
                        </div>
                        <div>
                            <label htmlFor="enddate" className="block text-sm font-medium mb-1">End Date</label>
                            <input value={endDate} id="enddate" type="date" className="w-full border rounded px-3 py-2" onChange={e => setEndDate(e.target.value)}/>
                        </div>
                        <div>
                            <label htmlFor="sortfield" className="block text-sm font-medium mb-1">Sort Field</label>
                            <select value={sortField} id="sortfield" className="w-full border rounded px-3 py-2" onChange={e => setSortField(e.target.value)}>
                                <option value="date">Date</option>
                                <option value="amount">Amount</option>
                                <option value="name">Name</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sortorder" className="block text-sm font-medium mb-1">Sort Order</label>
                            <select value={sortOrder} id="sortorder" className="w-full border rounded px-3 py-2" onChange={e => setSortOrder(e.target.value)}>
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>

                        {/* Search and Button - spanning 2 columns on large screens */}
                        <div className="sm:col-span-2 md:col-span-3 lg:col-span-2 flex items-end">
                            <div className="w-full">
                                <label htmlFor="keyword" className="block text-sm font-medium mb-1">Search</label>
                                <input value={keyword} id="keyword" type="text" placeholder="Search by name..." className="w-full border rounded px-3 py-2" onChange={e => setKeyword(e.target.value)} />
                            </div>
                            <button onClick={handleSearch} className="ml-2 mb-1 p-2 bg-purple-800 hover:bg-purple-900 text-white rounded flex items-center justify-center cursor-pointer transition-colors">
                                <Search size={20} />
                            </button>
                        </div>
                    </form>
                </div>

                <div className="card p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-semibold">Transactions</h5>
                        {transactions.length > 0 && (
                            <span className="text-sm text-gray-500">{transactions.length} found</span>
                        )}
                    </div>
                    {transactions.length === 0 && !loading ? (
                        <div className="text-center py-8 text-gray-500">
                             <p>No transactions match your filters.</p>
                        </div>
                    ) : ""}
                    
                    {loading ? (
                         <div className="text-center py-8 text-gray-500">
                            <p>Loading Transactions...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {transactions.map((transaction) => (
                                <TransactionInfoCard
                                    key={transaction.id}
                                    title={transaction.name}
                                    icon={transaction.icon}
                                    date={moment(transaction.date).format('Do MMM YYYY')}
                                    amount={transaction.amount}
                                    type={type}
                                    hideDeleteBtn
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Dashboard>
    )
}

export default Filter;