import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Tag,
  ChevronRight,
  Folder,
} from "lucide-react";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "" });

  // Filter state
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchName, setSearchName] = useState("");

  const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory: apiDeleteCategory,
    isLoading: storeLoading,
  } = useAuthStore();

  // ✅ Fetch from Backend API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Categories fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Open modal
  const openCategoryModal = (category = null, parentCategoryId = null) => {
    if (category) {
      setCategoryForm({
        name: category.name,
        slug: category.slug,
      });
      setEditingCategoryId(category._id || category.id);
      setParentId(null);
    } else {
      setCategoryForm({ name: "", slug: "" });
      setEditingCategoryId(null);
      setParentId(parentCategoryId);
    }
    setIsModalOpen(true);
  };

  // ✅ Save to Backend API
  const saveCategory = async () => {
    try {
      const formData = {
        name: categoryForm.name,
        slug: categoryForm.slug.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        parentCategory: parentId || null,
      };

      if (editingCategoryId) {
        await updateCategory(editingCategoryId, formData);
      } else {
        await createCategory(formData);
      }

      fetchCategories();
      closeModal();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // ✅ Delete from Backend API
  const deleteCategory = async (id) => {
    if (window.confirm("Delete this category?")) {
      try {
        await apiDeleteCategory(id);
        fetchCategories();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategoryId(null);
    setParentId(null);
    setCategoryForm({ name: "", slug: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500 animate-pulse">
          Loading categories...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Category Management
          </h2>
          <p className="text-gray-600 mt-1">
            Main & Sub Categories ({categories.length})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="🔍 Search categories..."
            className="flex-1 min-w-50 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button
            onClick={() => openCategoryModal(null, null)}
            disabled={storeLoading}
            className="px-6 py-2 bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Folder className="w-5 h-5" />
            Main Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category._id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"
          >
            {/* Main Category Card */}
            <div className="p-6 border-b bg-linear-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-linear-to-br from-emerald-400 to-teal-500 rounded-2xl mr-4 flex items-center justify-center shadow-xl group-hover:scale-110 transition-all">
                    <Folder className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 leading-tight">
                      {category.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded-lg">
                        /{category.slug}/
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          category.isActive
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => openCategoryModal(null, category._id)}
                    className="p-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl hover:scale-110 transition-all shadow-md"
                    title="Add Sub Category"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openCategoryModal(category)}
                    className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl hover:scale-110 transition-all shadow-md"
                    title="Edit Category"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCategory(category._id)}
                    className="p-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl hover:scale-110 transition-all shadow-md"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ✅ COMPLETE SUB-CATEGORIES UI */}
            {category.subCategories && category.subCategories.length > 0 && (
              <div className="p-6 bg-linear-to-b from-gray-50 to-white border-t">
                <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
                  <ChevronRight className="w-5 h-5 text-purple-600" />
                  Sub Categories ({category.subCategories.length})
                </h4>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {category.subCategories.map((sub) => (
                    <div
                      key={sub._id}
                      className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white hover:shadow-md transition-all border border-gray-100 hover:border-purple-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-linear-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-lg shrink-0">
                          {sub.name.slice(0, 3).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-900 truncate block leading-tight">
                            {sub.name}
                          </span>
                          <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded-md">
                            /{sub.slug}/
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        <div className="flex gap-1">
                          <button
                            onClick={() => openCategoryModal(sub, category._id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg hover:scale-105 transition-all"
                            title="Edit Sub Category"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteCategory(sub._id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg hover:scale-105 transition-all"
                            title="Delete Sub Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden border border-white/50">
            <div className="p-6 border-b bg-linear-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Tag className="w-7 h-7 text-indigo-600" />
                  {editingCategoryId ? "Edit" : "New"}{" "}
                  {parentId ? "Sub" : "Main"} Category
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-200 rounded-2xl transition-all hover:scale-110"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  placeholder="e.g. Winter Collection, Shirts, Electronics"
                  className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-300 transition-all shadow-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, slug: e.target.value })
                  }
                  placeholder="e.g. winter-collection"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-300 transition-all shadow-sm"
                />
              </div>

              {parentId && (
                <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-sm">
                  <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                    📁 Parent Category:
                    <span className="font-black bg-blue-200 px-3 py-1 rounded-xl text-blue-900">
                      {categories.find((c) => c._id === parentId)?.name ||
                        "Loading..."}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-linear-to-r from-gray-50 to-white flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-100 hover:border-gray-400 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveCategory}
                disabled={!categoryForm.name.trim() || storeLoading}
                className="px-8 py-3 bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" />
                {editingCategoryId ? "Update Category" : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
