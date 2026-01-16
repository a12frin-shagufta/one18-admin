import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FiPlus, FiTrash, FiArrowLeft, FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";

const MAX_IMAGES = 5;

const EditMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [name, setName] = useState("");
  const [variants, setVariants] = useState([{ label: "", price: "" }]);
  const [removedImages, setRemovedImages] = useState([]);
  const token = localStorage.getItem("adminToken");

  const [existingImages, setExistingImages] = useState([]);
  const [images, setImages] = useState([]);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [servingInfo, setServingInfo] = useState("");

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [festivals, setFestivals] = useState([]);
  const [festivalId, setFestivalId] = useState("");

  const [branches, setBranches] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);

  const [preorderEnabled, setPreorderEnabled] = useState(false);
  const [minDays, setMinDays] = useState(0);
  const [prepaidRequired, setPrepaidRequired] = useState(false);

  // ✅ Mobile Tabs
  const [activeSection, setActiveSection] = useState("basic");

  const sections = [
    { id: "basic", label: "Basic Info" },
    { id: "details", label: "Details" },
    { id: "pricing", label: "Pricing" },
    { id: "media", label: "Media" },
    { id: "branches", label: "Branches" },
  ];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesRes, categoriesRes, festivalsRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/branches`),
          axios.get(`${BACKEND_URL}/api/categories`),
          axios.get(`${BACKEND_URL}/api/festivals`),
        ]);
        setBranches(branchesRes.data);
        setCategories(categoriesRes.data);
        setFestivals(festivalsRes.data);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        toast.error("❌ Failed to load initial data");
      }
    };
    fetchData();
  }, []);

  // Fetch item data
  useEffect(() => {
    if (!id) return;

    axios
      .get(`${BACKEND_URL}/api/menu/${id}`)
      .then((res) => {
        const item = res.data;

        setName(item.name || "");
        setDescription(item.description || "");
        setServingInfo(item.servingInfo || "");
        setCategoryId(item.category?._id || "");
        setSubcategoryId(item.subcategory?._id || "");
        setFestivalId(item.festival?._id || "");
        setVariants(
          item.variants?.length ? item.variants : [{ label: "", price: "" }]
        );
        setIsBestSeller(!!item.isBestSeller);
        setInStock(item.inStock !== false);
        setExistingImages(item.images || []);
        setSelectedBranches(item.branches || []);

        if (item.preorder?.enabled) {
          setPreorderEnabled(true);
          setMinDays(item.preorder.minDays || 0);
          setPrepaidRequired(!!item.preorder.prepaidRequired);
        } else {
          setPreorderEnabled(false);
          setMinDays(0);
          setPrepaidRequired(false);
        }

        // Fetch subcategories if category exists
        if (item.category?._id) {
          axios
            .get(`${BACKEND_URL}/api/subcategories?category=${item.category._id}`)
            .then((res) => setSubcategories(res.data));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch item:", err);
        toast.error("❌ Failed to load item");
      });
  }, [id]);

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

  // Image handlers
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const remaining = MAX_IMAGES - existingImages.length;

    setImages((prev) => [...prev, ...files].slice(0, remaining));
  };

  const removeNewImage = (i) => {
    setImages(images.filter((_, index) => index !== i));
  };

  // Variant handlers
  const updateVariant = (i, field, value) => {
    const copy = [...variants];
    copy[i][field] = value;
    setVariants(copy);
  };

  const addVariant = () => setVariants([...variants, { label: "", price: "" }]);

  const removeVariant = (i) => {
    if (variants.length === 1) return;
    setVariants(variants.filter((_, index) => index !== i));
  };

  // Branch selection
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

  // Submit handler
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!categoryId) {
      toast.error("❌ Please select a category");
      return;
    }

    const cleanedVariants = variants
      .filter((v) => v.price !== "" && Number(v.price) > 0)
      .map((v) => ({
        label: v.label?.trim() || "",
        price: Number(v.price),
      }));

    if (cleanedVariants.length === 0) {
      toast.error("❌ At least one variant price is required");
      return;
    }

    if (selectedBranches.length === 0) {
      toast.error("❌ Please select at least one branch");
      return;
    }

    const data = new FormData();
    data.append("name", name.trim());
    data.append("description", description || "");
    data.append("servingInfo", servingInfo || "");
    data.append("category", categoryId);
    data.append("variants", JSON.stringify(cleanedVariants));
    data.append("isBestSeller", isBestSeller);
    data.append("inStock", inStock);
    data.append("removedImages", JSON.stringify(removedImages || []));
    data.append("branches", JSON.stringify(selectedBranches));
    data.append(
      "preorder",
      JSON.stringify({
        enabled: preorderEnabled,
        minDays,
        prepaidRequired,
      })
    );

    if (subcategoryId) data.append("subcategory", subcategoryId);
    if (festivalId) data.append("festival", festivalId);
    images.forEach((img) => data.append("images", img));

    try {
      setLoading(true);

      await axios.put(`${BACKEND_URL}/api/menu/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("✅ Menu item updated!");
      navigate("/admin/menu");
    } catch (err) {
      console.error("UPDATE ERROR:", err.response?.data || err);
      toast.error(err.response?.data?.message || "❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/menu")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft />
            <span>Back to Menu</span>
          </button>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Edit Menu Item
          </h1>
          <p className="text-gray-600 mt-2">Update your menu item details</p>
        </div>

        {/* ✅ Sticky Mobile Tabs */}
        <div className="md:hidden mb-6 sticky top-0 z-30 bg-gray-50 pt-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition
                  ${
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
          {/* Left Column */}
          <div className="lg:w-2/3 space-y-6">
            {/* Basic Information Card */}
            <div
              className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 ${
                activeSection === "basic" ? "block" : "hidden md:block"
              }`}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Product description"
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

            {/* Category & Details Card */}
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
                    Festival (optional)
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

                {/* Toggles */}
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
                      <span className="font-medium text-gray-900">In Stock</span>
                      <p className="text-sm text-gray-500">
                        Available for order
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
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
                          value={variant.label}
                          onChange={(e) =>
                            updateVariant(i, "label", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="e.g., Small, Medium, Large"
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
                            value={variant.price}
                            onChange={(e) =>
                              updateVariant(i, "price", e.target.value)
                            }
                            required
                            className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="0.00"
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
          </div>

          {/* Right Column - Responsive (show on mobile only when Branches tab selected) */}
          <div
            className={`lg:w-1/3 space-y-6 ${
              activeSection === "branches" ? "block" : "hidden lg:block"
            }`}
          >
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

            {/* Preorder Card */}
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

                    <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
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
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Media Card (same UI, inside right column like your original) */}
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
                <p className="text-sm text-gray-600 mb-2">
                  Upload new images or remove existing ones (max {MAX_IMAGES} total)
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Existing Images */}
                  {existingImages.map((img, i) => (
                    <div
                      key={`old-${i}`}
                      className="aspect-square relative rounded-lg overflow-hidden border group"
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt={`Existing ${i + 1}`}
                      />

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />

                      <button
                        type="button"
                        onClick={() => {
                          setExistingImages((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          );
                          setRemovedImages((prev) => [...prev, img]);
                        }}
                        className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center text-sm active:scale-95 transition"
                      >
                        ✕
                      </button>

                      <div className="absolute bottom-2 left-2 text-xs text-white bg-black/60 rounded px-2 py-1">
                        Existing
                      </div>
                    </div>
                  ))}

                  {/* New Images */}
                  {images.map((img, i) => (
                    <div
                      key={`new-${i}`}
                      className="aspect-square relative rounded-lg overflow-hidden border group"
                    >
                      <img
                        src={URL.createObjectURL(img)}
                        className="w-full h-full object-cover"
                        alt={`New ${i + 1}`}
                      />

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />

                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center text-sm active:scale-95 transition"
                      >
                        ✕
                      </button>

                      <div className="absolute bottom-2 left-2 text-xs text-white bg-black/60 rounded px-2 py-1">
                        New
                      </div>
                    </div>
                  ))}

                  {/* Add Image Button */}
                  {existingImages.length + images.length < MAX_IMAGES && (
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <FiPlus className="text-2xl text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </label>
                  )}
                </div>

                <p className="text-sm text-gray-500 text-center">
                  {existingImages.length + images.length} of {MAX_IMAGES} images
                </p>
              </div>
            </div>

            {/* Desktop Submit Button (kept) */}
            <div className="hidden md:block">
              <button
                type="button"
                onClick={submitHandler}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : (
                  "Update Menu Item"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile helper */}
        <div className="md:hidden mt-6 text-center text-sm text-gray-500">
          <p>Use the tabs above to navigate between sections</p>
        </div>
      </div>

      {/* ✅ Sticky Bottom Update Button (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t p-3">
        <button
          type="button"
          onClick={submitHandler}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Updating..." : "Update Menu Item"}
        </button>
      </div>
    </div>
  );
};

export default EditMenu;
