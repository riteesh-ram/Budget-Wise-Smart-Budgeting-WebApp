import {Layers2, Pencil} from "lucide-react";

const CategoryList = ({categories, onEditCategory, selectedIds, onToggleSelection}) => {
    return (
        <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Category Sources</h4>
                {selectedIds.length > 0 && (
                    <span className="text-sm text-purple-600 font-medium">
                        {selectedIds.length} Selected
                    </span>
                )}
            </div>

            {/* Category list */}
            {categories.length === 0 ? (
                <p className="text-gray-500">
                    No categories added yet. Add some to get started!
                </p>
            ): (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((category) => {
                        const isSelected = selectedIds.includes(category.id);
                        return (
                            <div
                                key={category.id}
                                onClick={() => onToggleSelection(category.id)} // Click card to select
                                className={`group relative flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer select-none
                                    ${isSelected 
                                        ? "bg-purple-50 border-purple-500 shadow-sm" 
                                        : "bg-white border-transparent hover:bg-gray-100/60 hover:border-gray-200"
                                    }`}
                            >
                                {/* Checkbox for visual clarity */}
                                <input 
                                    type="checkbox" 
                                    checked={isSelected}
                                    readOnly
                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                                />

                                {/* Icon/Emoji display*/}
                                <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full">
                                    {category.icon ? (
                                        <span className="text-2xl">
                                            <img src={category.icon} alt={category.name} className="h-5 w-5" />
                                        </span>
                                    ): (
                                        <Layers2 className="text-purple-800" size={24} />
                                    )}
                                </div>

                                {/* Category Details*/}
                                <div className="flex-1 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700 font-medium">
                                            {category.name}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1 capitalize">
                                            {category.type}
                                        </p>
                                    </div>
                                    
                                    {/* Edit Button - Stop propagation to prevent selecting the card when clicking edit */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditCategory(category);
                                        }}
                                        className="text-gray-400 hover:text-blue-500 p-2 z-10">
                                        <Pencil size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default CategoryList;