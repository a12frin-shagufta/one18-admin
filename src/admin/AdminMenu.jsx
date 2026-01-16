import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiTrash, FiUpload, FiInfo } from "react-icons/fi";
import { toast } from "react-toastify";

const AdminMenu = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [name, setName] = useState("");
  const [variants, setVariants] = useState([{ label: "", price: "" }]);
  const [images, setImages] = useState([]);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [festivals, setFestivals] = useState([]);
  const [festivalId, setFestivalId] = useState("");
  const [description, setDescription] = useState("");
  const [servingInfo, setServingInfo] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [preorderEnabled, setPreorderEnabled] = useState(false);
  const [minDays, setMinDays] = useState(0);
  const [prepaidRequired, setPrepaidRequired] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");

  const MAX_IMAGES = 5;
  const token = localStorage.getItem("adminToken");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [festivalsRes, branchesRes, categoriesRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/festivals`),
          axios.get(`${BACKEND_URL}/api/branches`),
          axios.get(`${BACKEND_URL}/api/categories`),
        ]);
        setFestivals(festivalsRes.data);
        setBranches(branchesRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load initial data");
      }
    };
    fetchData();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (categoryId) {
      axios
        .get(`${BACKEND_URL}/api/subcategories?category=${categoryId}`)
        .then((res) => setSubcategories(res.data))
        .catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
      setSubcategoryId("");
    }
  }, [categoryId]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    setImages((prev) => [...prev, ...files].slice(0, MAX_IMAGES));
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, value) => {
    const copy = [...variants];
    copy[index][field] = value;
    setVariants(copy);
  };

  const addVariant = () => {
    setVariants([...variants, { label: "", price: "" }]);
  };

  const removeVariant = (index) => {
    if (variants.length === 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const toggleBranch = (branchId) => {
    setSelectedBranches((prev) =>
      prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId]
    );
  };

  const selectAllBranches = () => {
    setSelectedBranches(branches.map((branch) => branch._id));
  };

  const clearAllBranches = () => {
    setSelectedBranches([]);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Validation
    if (!categoryId) {
      toast.error("❌ Please select a category");
      return;
    }

    if (images.length === 0) {
      toast.error("❌ Please upload at least one image");
      return;
    }

    if (variants.some((v) => !v.price)) {
      toast.error("❌ Please enter price for all variants");
      return;
    }

    if (selectedBranches.length === 0) {
      toast.error("❌ Please select at least one branch");
      return;
    }

    const cleanedVariants = variants.map((v) => ({
      label: v.label?.trim() || "Default",
      price: Number(v.price),
    }));

    const data = new FormData();
    data.append("name", name);
    data.append("description", description);
    data.append("servingInfo", servingInfo);
    data.append("category", categoryId);
    data.append("subcategory", subcategoryId);
    data.append("variants", JSON.stringify(cleanedVariants));
    data.append("isBestSeller", isBestSeller);
    data.append("inStock", inStock);
    if (festivalId) data.append("festival", festivalId);
    data.append("branches", JSON.stringify(selectedBranches));
    data.append(
      "preorder",
      JSON.stringify({
        enabled: preorderEnabled,
        minDays,
        prepaidRequired,
      })
    );
    images.forEach((img) => data.append("images", img));

    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/api/menu`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("✅ Menu item added successfully!");

      // Reset form
      setName("");
      setDescription("");
      setServingInfo("");
      setCategoryId("");
      setSubcategoryId("");
      setSelectedBranches([]);
      setPreorderEnabled(false);
      setMinDays(0);
      setPrepaidRequired(false);
      setVariants([{ label: "", price: "" }]);
      setImages([]);
      setIsBestSeller(false);
      setInStock(true);
      setFestivalId("");
      setActiveSection("basic");
    } catch (err) {
      const msg =
        err.response?.data?.message || "❌ Failed to add item. Try again!";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Navigation tabs for mobile
  const sections = [
    { id: "basic", label: "Basic Info" },
    { id: "details", label: "Details" },
    { id: "pricing", label: "Pricing" },
    { id: "media", label: "Media" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Add New Menu Item
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to add a new item to your menu
          </p>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden mb-6">
          <div className="flex overflow-x-auto pb-2 gap-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form Sections */}
          <div className="lg:w-2/3">
            <form onSubmit={submitHandler} className="space-y-6">
              {/* Basic Information Section */}
              <div
                className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 ${
                  activeSection === "basic" ? "block" : "hidden md:block"
                }`}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiInfo className="text-blue-600" />
                  Basic Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter product name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe your product (optional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serving Information
                    </label>
                    <textarea
                      placeholder="Example: 5 inch cakes: For 3 to 5 pax | 8 inch cakes: For 8 to 12 pax"
                      value={servingInfo}
                      onChange={(e) => setServingInfo(e.target.value)}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Category & Details Section */}
              <div
                className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 ${
                  activeSection === "details" ? "block" : "hidden md:block"
                }`}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Category & Details
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subcategory
                      </label>
                      <select
                        value={subcategoryId}
                        onChange={(e) => setSubcategoryId(e.target.value)}
                        disabled={!categoryId}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Subcategory (optional)</option>
                        {subcategories.map((sub) => (
                          <option key={sub._id} value={sub._id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Festival (Optional)
                    </label>
                    <select
                      value={festivalId}
                      onChange={(e) => setFestivalId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                      <option value="">No Festival</option>
                      {festivals.map((f) => (
                        <option key={f._id} value={f._id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Availability Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                    <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={isBestSeller}
                        onChange={(e) => setIsBestSeller(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <div>
                        <span className="font-medium text-gray-900">
                          Best Seller
                        </span>
                        <p className="text-sm text-gray-500">
                          Mark as featured item
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <div>
                        <span className="font-medium text-gray-900">
                          In Stock
                        </span>
                        <p className="text-sm text-gray-500">
                          Available for order
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Pricing & Variants Section */}
              <div
                className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 ${
                  activeSection === "pricing" ? "block" : "hidden md:block"
                }`}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Pricing & Variants
                </h2>
                <div className="space-y-4">
                  {variants.map((variant, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-4 border rounded-lg"
                    >
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Variant Label
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Small, Medium, Large"
                            value={variant.label}
                            onChange={(e) =>
                              updateVariant(i, "label", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              $
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={variant.price}
                              onChange={(e) =>
                                updateVariant(i, "price", e.target.value)
                              }
                              required
                              className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        disabled={variants.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiTrash size={20} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <FiPlus />
                    Add Another Variant
                  </button>
                </div>
              </div>

              {/* Media Upload Section */}
              <div
                className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 ${
                  activeSection === "media" ? "block" : "hidden md:block"
                }`}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiUpload className="text-blue-600" />
                  Product Images
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Images (max {MAX_IMAGES})
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {/* Upload Button */}
                      {images.length < MAX_IMAGES && (
                        <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                          <FiPlus className="text-2xl text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Add Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageSelect}
                          />
                        </label>
                      )}

                      {/* Image Previews */}
                      {images.map((img, index) => (
                        <div
                          key={index}
                          className="aspect-square relative rounded-xl overflow-hidden border group"
                        >
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                          <div className="absolute bottom-2 left-2 right-2 text-xs text-white bg-black/60 rounded px-2 py-1 truncate">
                            {img.name}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-3">
                      {images.length} of {MAX_IMAGES} images uploaded
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button (Mobile) */}
              <div className="md:hidden">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding Item...
                    </span>
                  ) : (
                    "Add Menu Item"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-1/3">
            <div className="space-y-6">
              {/* Branches Card */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Available Branches *
                </h2>
                <div className="space-y-3">
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={selectAllBranches}
                      className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={clearAllBranches}
                      className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {branches.map((branch) => (
                      <label
                        key={branch._id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBranches.includes(branch._id)}
                          onChange={() => toggleBranch(branch._id)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">
                            {branch.name}
                          </span>
                          <p className="text-sm text-gray-500 truncate">
                            {branch.address}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedBranches.length} of {branches.length} branches selected
                  </p>
                </div>
              </div>

              {/* Preorder Settings Card */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Preorder Settings
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={preorderEnabled}
                      onChange={(e) => setPreorderEnabled(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div>
                      <span className="font-medium text-gray-900">
                        Enable Preorder
                      </span>
                      <p className="text-sm text-gray-500">
                        Available for advance booking
                      </p>
                    </div>
                  </label>

                  {preorderEnabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Advance Days
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={minDays}
                            onChange={(e) => setMinDays(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                            days
                          </span>
                        </div>
                      </div>

                      {/* <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={prepaidRequired}
                          onChange={(e) => setPrepaidRequired(e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <div>
                          <span className="font-medium text-gray-900">
                            Require Prepayment
                          </span>
                          <p className="text-sm text-gray-500">
                            Full payment required at booking
                          </p>
                        </div>
                      </label> */}
                    </>
                  )}
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{name || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">
                      {categories.find((c) => c._id === categoryId)?.name || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Variants:</span>
                    <span className="font-medium">{variants.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Images:</span>
                    <span className="font-medium">{images.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Branches:</span>
                    <span className="font-medium">{selectedBranches.length}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Submit Button */}
              <div className="hidden md:block">
                <button
                  type="submit"
                  onClick={submitHandler}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding Menu Item...
                    </span>
                  ) : (
                    "Add to Menu"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Instructions */}
        <div className="md:hidden mt-6 text-center text-sm text-gray-500">
          <p>Use the tabs above to navigate between sections</p>
        </div>
      </div>
    </div>
  );
};

export default AdminMenu;