import { useState, useEffect, useRef } from "react";
import { useProductStore } from "../../store/useProductStore";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const Products = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [mainCategory, setMainCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [subCategory, setSubCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);

  const fileInputRef = useRef(null);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    mainCategory: "",
    subCategory: "",
    size: ["M"],
    color: ["Black"],
    images: [],
    isFeatured: false,
    discount: 0,
  });

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchName, setSearchName] = useState("");
  const { products, getProducts, createProduct, updateProduct, loading } =
    useProductStore();

  useEffect(() => {
    getProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    if (mainCategory) {
      const mainCat = categories.find((cat) => cat._id === mainCategory);
      setSubCategories(mainCat?.subCategories || []);
    } else {
      setSubCategories([]);
    }
  }, [mainCategory, categories]);

  const loadCategories = async () => {
    setCategoryLoading(true);
    try {
      const { data } = await api.get("/categories");
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Categories load error:", error);
      setCategories([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const { data } = await api.post("/uploads/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success && data.url) {
        setProductForm((prev) => ({
          ...prev,
          images: [...prev.images, data.url],
        }));
        setImagePreview(data.url);
      }
    } catch (error) {
      toast.error("Image upload failed");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openProductModal = (product = null) => {
    if (product) {
      setProductForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock || "",
        mainCategory: product.parentCategoryId || product.parentCategory || "",
        subCategory: product.categoryId || product.category?._id || "",
        size: product.size || ["M"],
        color: Array.isArray(product.color) ? product.color : ["Black"],
        images: product.images || [],
        isFeatured: product.isFeatured || false,
        discount: product.discount || 0,
      });
      setMainCategory(product.parentCategoryId || product.parentCategory || "");
      setSubCategory(product.categoryId || product.category?._id || "");
      setImagePreview(product.images?.[0] || "");
      setEditingProductId(product.id || product._id);
    } else {
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        mainCategory: "",
        subCategory: "",
        size: ["M"],
        color: ["Black"],
        images: [],
        isFeatured: false,
        discount: 0,
      });
      setMainCategory("");
      setSubCategory("");
      setImagePreview("");
      setEditingProductId(null);
    }
    setIsModalOpen(true);
  };

  // ✅ FIXED: Proper validation + discount handling
  const saveProduct = async () => {
    // Validation
    if (!productForm.name.trim()) {
      toast.error("Product name is required!");
      return;
    }
    if (
      !productForm.price ||
      isNaN(productForm.price) ||
      parseFloat(productForm.price) <= 0
    ) {
      toast.error("Valid price is required!");
      return;
    }
    if (
      !productForm.stock ||
      isNaN(productForm.stock) ||
      parseInt(productForm.stock) < 0
    ) {
      toast.error("Valid stock is required!");
      return;
    }
    if (!productForm.subCategory) {
      toast.error("Please select a sub category!");
      return;
    }

    try {
      const formData = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        category: productForm.subCategory,
        parentCategory: productForm.mainCategory || undefined,
        size: productForm.size,
        color: productForm.color,
        images: productForm.images,
        isFeatured: productForm.isFeatured,
        discount: parseInt(productForm.discount) || 0, // ✅ FIXED DISCOUNT
      };

      console.log("📤 Saving:", formData); // Debug

      if (editingProductId) {
        await updateProduct(editingProductId, formData);
        toast.success("Product updated successfully!");
      } else {
        await createProduct(formData);
        toast.success("Product created successfully!");
      }

      await getProducts();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.response?.data?.message || "Save failed!");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await api.delete(`/products/admin/${id}`);
        toast.success("Product deleted!");
        await getProducts();
      } catch (error) {
        toast.error("Delete failed!");
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const statusMatch =
      filterStatus === "all" || product.status === filterStatus;
    const nameMatch = product.name
      .toLowerCase()
      .includes(searchName.toLowerCase());
    return statusMatch && nameMatch;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );

  return (
    <div className="p-6">
      {/* Header + Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-600">Manage your store ({products.length})</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search products..."
            className="flex-1 min-w-62.5 px-4 py-2 border rounded-xl focus:ring-2"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-xl"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <button
            onClick={() => openProductModal()}
            className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Product
          </button>
        </div>
      </div>

      {/* Count */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-bold text-purple-600">
            {filteredProducts.length}
          </span>{" "}
          of <span className="font-bold">{products.length}</span>
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {products.length === 0
                      ? "No products. Add first!"
                      : "No matches."}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={product.images?.[0] || "/api/placeholder/64/64"}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-xl mr-4"
                        />
                        <div>
                          <span className="font-semibold">{product.name}</span>
                          <span className="text-xs text-gray-500 block">
                            {product.description?.slice(0, 50)}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-purple-600">
                       ₹
                          {(
                            product.price *
                            (1 - product.discount / 100)
                          ).toLocaleString()}
                      {product.discount > 0 && (
                        <span className="text-sm text-gray-500 line-through block">
                          ₹{product.price?.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-6 py-4 font-bold ${product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-yellow-600" : "text-red-600"}`}
                    >
                      {product.stock}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${product.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {product.categoryName || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openProductModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">
                  {editingProductId ? "Edit Product" : "Add Product"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold mb-3">
                  Images
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-emerald-400 flex items-center justify-center gap-2"
                    >
                      {uploadingImage ? (
                        "Uploading..."
                      ) : (
                        <>
                          <Upload className="w-5 h-5" /> Choose Image
                        </>
                      )}
                    </button>
                  </div>
                  {imagePreview && (
                    <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                {productForm.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {productForm.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Product"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    className="w-full p-4 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: e.target.value })
                    }
                    className="w-full p-4 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock: e.target.value })
                    }
                    placeholder="50"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500 shadow-sm"
                    min="0"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Main Category
                  </label>
                  <select
                    value={productForm.mainCategory}
                    onChange={(e) => {
                      const value = e.target.value;
                      setProductForm({ ...productForm, mainCategory: value });
                      setMainCategory(value);
                      setProductForm((prev) => ({ ...prev, subCategory: "" }));
                      setSubCategory("");
                    }}
                    className="w-full p-4 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-500"
                  >
                    <option value="">Select Main Category</option>
                    {categories
                      .filter((cat) => !cat.parentCategory)
                      .map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Sub Category *
                  </label>
                  <select
                    value={productForm.subCategory}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        subCategory: e.target.value,
                      })
                    }
                    disabled={!mainCategory}
                    className="w-full p-4 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-500 disabled:bg-gray-50"
                  >
                    <option value="">
                      {!mainCategory
                        ? "Select main first"
                        : "Select Sub Category"}
                    </option>
                    {subCategories.map((subCat) => (
                      <option key={subCat._id} value={subCat._id}>
                        {subCat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">
                  Description
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full p-4 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Sizes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["S", "M", "L", "XL", "XXL"].map((size) => (
                      <label
                        key={size}
                        className="flex items-center gap-1 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={productForm.size.includes(size)}
                          onChange={(e) => {
                            const newSizes = e.target.checked
                              ? [...productForm.size, size]
                              : productForm.size.filter((s) => s !== size);
                            setProductForm({ ...productForm, size: newSizes });
                          }}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="text-sm">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Colors *
                  </label>

                  {/* 🆕 AMAZON-STYLE COLOR CHECKBOXES */}
                  <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-xl">
                    {[
                      { name: "Black", color: "#000000" },
                      { name: "White", color: "#FFFFFF" },
                      { name: "Red", color: "#FF0000" },
                      { name: "Blue", color: "#0066CC" },
                      { name: "Green", color: "#00AA00" },
                      { name: "Yellow", color: "#FFD700" },
                      { name: "Pink", color: "#FF69B4" },
                      { name: "Purple", color: "#8A2BE2" },
                      { name: "Orange", color: "#FF8C00" },
                      { name: "Gray", color: "#808080" },
                      { name: "Navy", color: "#000080" },
                      { name: "Maroon", color: "#800000" },
                    ].map(({ name, color }) => (
                      <label
                        key={name}
                        className="flex items-center gap-2 p-2 rounded-xl cursor-pointer hover:bg-white hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={productForm.color.includes(name)}
                            onChange={(e) => {
                              const newColors = e.target.checked
                                ? [...productForm.color, name]
                                : productForm.color.filter((c) => c !== name);
                              setProductForm({
                                ...productForm,
                                color: newColors,
                              });
                            }}
                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 hidden"
                          />
                          <div
                            className={`w-6 h-6 rounded-lg border-4 transition-all group-hover:scale-110 ${
                              productForm.color.includes(name)
                                ? "border-emerald-500 shadow-lg shadow-emerald-200 ring-4 ring-emerald-100"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 whitespace-nowrap">
                          {name}
                        </span>
                      </label>
                    ))}
                  </div>
                  {productForm.color.length > 0 && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <p className="text-xs font-semibold text-emerald-800 mb-2 flex items-center gap-1">
                        ✅ Selected:{" "}
                        <span className="font-bold">
                          {productForm.color.length}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {productForm.color.map((colorName, idx) => (
                          <div
                            key={idx}
                            className="px-2 py-1 bg-white text-xs font-bold text-gray-800 rounded-full shadow-sm border flex items-center gap-1"
                          >
                            <div
                              className="w-3 h-3 rounded-full border-2 border-gray-300"
                              style={{
                                backgroundColor: [
                                  "#000000",
                                  "#FFFFFF",
                                  "#FF0000",
                                  "#0066CC",
                                  "#00AA00",
                                  "#FFD700",
                                  "#FF69B4",
                                  "#8A2BE2",
                                  "#FF8C00",
                                  "#808080",
                                  "#000080",
                                  "#800000",
                                ][
                                  [
                                    "Black",
                                    "White",
                                    "Red",
                                    "Blue",
                                    "Green",
                                    "Yellow",
                                    "Pink",
                                    "Purple",
                                    "Orange",
                                    "Gray",
                                    "Navy",
                                    "Maroon",
                                  ].indexOf(colorName)
                                ],
                              }}
                            />
                            {colorName}
                            <button
                              onClick={() =>
                                setProductForm((prev) => ({
                                  ...prev,
                                  color: prev.color.filter(
                                    (c) => c !== colorName,
                                  ),
                                }))
                              }
                              className="ml-1 text-gray-400 hover:text-red-500 text-xs font-bold hover:scale-110 transition-all"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Discount %
                  </label>
                  <input
                    type="number"
                    value={productForm.discount}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        discount: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    max="90"
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl">
                <input
                  type="checkbox"
                  checked={productForm.isFeatured}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      isFeatured: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-emerald-600 rounded"
                />
                <span className="font-semibold text-emerald-800">
                  Featured Product
                </span>
              </label>
            </div>

            <div className="p-6 border-t flex gap-3 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 border text-gray-700 font-semibold rounded-2xl hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={saveProduct}
                disabled={
                  !productForm.name.trim() ||
                  !productForm.price ||
                  !productForm.subCategory ||
                  uploadingImage
                }
                className="px-8 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:shadow-2xl disabled:opacity-50 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {editingProductId ? "Update Product" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
