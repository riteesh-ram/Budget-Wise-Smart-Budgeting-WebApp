import Dashboard from "../components/Dashboard.jsx";
import {useUser} from "../hooks/useUser.jsx";
import {Plus, Trash2} from "lucide-react";
import CategoryList from "../components/CategoryList.jsx";
import {useEffect, useState} from "react";
import axiosConfig from "../util/axiosConfig.jsx";
import {API_ENDPOINTS} from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import Modal from "../components/Modal.jsx";
import AddCategoryForm from "../components/AddCategoryForm.jsx";
import DeleteAlert from "../components/DeleteAlert.jsx"; // Assuming you have this from Income module

const Category = () => {
    useUser();
    const [loading, setLoading] = useState(false);
    const [categoryData, setCategoryData] = useState([]);
    const [openAddCategoryModal, setOpenAddCategoryModal] = useState(false);
    const [openEditCategoryModal, setOpenEditCategoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // NEW: Selection State
    const [selectedIds, setSelectedIds] = useState([]);
    const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

    const fetchCategoryDetails = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.GET_ALL_CATEGORIES);
            if (response.status === 200) {
                setCategoryData(response.data);
            }
        }catch(error) {
            console.error('Something went wrong. Please try again.', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCategoryDetails();
    }, []);

    // NEW: Handle Toggle Selection
    const handleToggleSelection = (id) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((item) => item !== id); // Remove
            } else {
                return [...prev, id]; // Add
            }
        });
    };

    // NEW: Handle Bulk Delete
    const handleDeleteCategories = async () => {
        if (selectedIds.length === 0) return;

        try {
            // Note: Use 'data' property for DELETE requests with bodies in axios
            const response = await axiosConfig.delete(API_ENDPOINTS.DELETE_CATEGORIES, {
                data: selectedIds
            });
            
            if (response.status === 204) {
                toast.success("Selected categories deleted successfully");
                setOpenDeleteAlert(false);
                setSelectedIds([]); // Clear selection
                fetchCategoryDetails(); // Refresh list
            }
        } catch (error) {
            console.error('Error deleting categories:', error);
            // Handling Foreign Key constraint (if category is used in Income/Expense)
            if(error.response?.status === 500) {
                 toast.error("Cannot delete categories that are used in Income/Expense transactions.");
            } else {
                toast.error(error.response?.data?.message || "Failed to delete categories.");
            }
        }
    };

    // ... existing add/update handlers ...
    const handleAddCategory = async (category) => {
       // ... keep existing code ...
        // (Copy from your original code)
        const {name, type, icon} = category;

        if (!name.trim()) {
            toast.error("Category Name is required");
            return;
        }

        const isDuplicate = categoryData.some((category) => {
            return category.name.toLowerCase() === name.trim().toLowerCase();
        })

        if (isDuplicate) {
            toast.error("Category Name already exists");
            return;
        }

        try {
            const response = await axiosConfig.post(API_ENDPOINTS.ADD_CATEGORY, {name, type, icon});
            if (response.status === 201) {
                toast.success("Category added successfully");
                setOpenAddCategoryModal(false);
                fetchCategoryDetails();
            }
        }catch (error) {
            console.error('Error adding category:', error);
            toast.error(error.response?.data?.message || "Failed to add category.");
        }
    }

    const handleEditCategory = (categoryToEdit) => {
        setSelectedCategory(categoryToEdit);
        setOpenEditCategoryModal(true);
    }

    const handleUpdateCategory = async (updatedCategory) => {
         // ... keep existing code ...
        // (Copy from your original code)
         const {id, name, type, icon} = updatedCategory;
        if (!name.trim()) {
            toast.error("Category Name is required");
            return;
        }

        if (!id) {
            toast.error("Category ID is missing for update");
            return;
        }

        try {
            await axiosConfig.put(API_ENDPOINTS.UPDATE_CATEGORY(id), {name, type, icon});
            setOpenEditCategoryModal(false);
            setSelectedCategory(null);
            toast.success("Category updated successfully");
            fetchCategoryDetails();
        }catch(error) {
            console.error('Error updating category:', error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || "Failed to update category.");
        }
    }

    return (
        <Dashboard activeMenu="Category">
            <div className="my-5 mx-auto">
                {/* Header: Changes based on selection */}
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-2xl font-semibold">All Categories</h2>
                    
                    {selectedIds.length > 0 ? (
                         // DELETE MODE BUTTON
                        <button
                            onClick={() => setOpenDeleteAlert(true)}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 font-medium"
                        >
                            <Trash2 size={18} />
                            Delete ({selectedIds.length})
                        </button>
                    ) : (
                        // NORMAL ADD BUTTON
                        <button
                            onClick={() => setOpenAddCategoryModal(true)}
                            className="add-btn flex items-center gap-1">
                            <Plus size={15} />
                            Add Category
                        </button>
                    )}
                </div>

                {/* Category list with Selection Props */}
                <CategoryList 
                    categories={categoryData} 
                    onEditCategory={handleEditCategory} 
                    selectedIds={selectedIds}
                    onToggleSelection={handleToggleSelection}
                />

                {/* Modals */}
                <Modal
                    isOpen={openAddCategoryModal}
                    onClose={() => setOpenAddCategoryModal(false)}
                    title="Add Category"
                >
                    <AddCategoryForm onAddCategory={handleAddCategory}/>
                </Modal>

                <Modal
                    onClose={() =>{
                        setOpenEditCategoryModal(false);
                        setSelectedCategory(null);
                    }}
                    isOpen={openEditCategoryModal}
                    title="Update Category"
                >
                    <AddCategoryForm
                        initialCategoryData={selectedCategory}
                        onAddCategory={handleUpdateCategory}
                        isEditing={true}
                    />
                </Modal>

                {/* DELETE CONFIRMATION MODAL */}
                <Modal
                    isOpen={openDeleteAlert}
                    onClose={() => setOpenDeleteAlert(false)}
                    title="Delete Categories"
                >
                    <DeleteAlert
                        content={`Are you sure you want to delete ${selectedIds.length} category(s)? This action cannot be undone.`}
                        onDelete={handleDeleteCategories}
                    />
                </Modal>
            </div>
        </Dashboard>
    )
}

export default Category;