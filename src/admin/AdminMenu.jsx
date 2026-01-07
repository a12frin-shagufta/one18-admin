import React, { useState , useEffect } from "react";
import axios from "axios";
import { FiPlus, FiTrash } from "react-icons/fi";

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
const [removedImages, setRemovedImages] = useState([]);
const [festivals, setFestivals] = useState([]);
const [festivalId, setFestivalId] = useState("");

const [description, setDescription] = useState("");
// BRANCHES
const [branches, setBranches] = useState([]);
const [selectedBranches, setSelectedBranches] = useState([]);

// PREORDER
const [preorderEnabled, setPreorderEnabled] = useState(false);
const [minDays, setMinDays] = useState(0);
const [prepaidRequired, setPrepaidRequired] = useState(false);



  /* ======================
     VARIANTS
  ====================== */

  const MAX_IMAGES = 5;


  const token = localStorage.getItem("adminToken");

  useEffect(() => {
  axios.get(`${BACKEND_URL}/api/festivals`)
    .then(res => setFestivals(res.data));
}, []);


useEffect(() => {
  axios
    .get(`${BACKEND_URL}/api/branches`)
    .then(res => setBranches(res.data))
    .catch(console.error);
}, []);


  useEffect(() => {
  axios.get(`${BACKEND_URL}/api/categories`)
    .then(res => setCategories(res.data));
}, []);


  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    setImages((prev) => {
      const combined = [...prev, ...files];
      return combined.slice(0, MAX_IMAGES);
    });
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

  /* ======================
     SUBMIT
  ====================== */
const submitHandler = async (e) => {
  e.preventDefault();

  if (!categoryId) {
    alert("Please select a category");
    return;
  }

  if (images.length === 0) {
    alert("Please upload at least one image");
    return;
  }

  if (variants.some((v) => !v.price)) {
    alert("Please enter price");
    return;
  }

  const cleanedVariants = variants.map((v) => ({
  label: v.label?.trim() || "Default",
  price: Number(v.price),
}));


  const data = new FormData();
  data.append("name", name);
  data.append("description", description);
  data.append("category", categoryId);        // ✅ FIX
  data.append("subcategory", subcategoryId); // ✅ FIX
  data.append("variants", JSON.stringify(cleanedVariants));
  data.append("isBestSeller", isBestSeller);
  data.append("inStock", inStock);

  if (festivalId) {
  data.append("festival", festivalId);
}

// 🔥 VALIDATION
if (selectedBranches.length === 0) {
  alert("Please select at least one branch");
  return;
}

// 🔥 BRANCHES
data.append("branches", JSON.stringify(selectedBranches));

// 🔥 PREORDER
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

    alert("Menu item added successfully ✅");

    // RESET
    setName("");
    setDescription("");

    setCategoryId("");
    setSelectedBranches([]);
setPreorderEnabled(false);
setMinDays(0);
setPrepaidRequired(false);

    setSubcategoryId("");
    setVariants([{ label: "", price: "" }]);
    setImages([]);
    setIsBestSeller(false);
    setInStock(true);
  } catch (err) {
    console.error(err);
    alert("Failed to add item");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-xl font-semibold mb-6">Add Menu Item</h1>

        <form onSubmit={submitHandler} className="space-y-5">
          {/* NAME */}
          <input
            type="text"
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2"
          />

          {/* DESCRIPTION */}
          <textarea
  placeholder="Product description (optional)"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={3}
  className="w-full border rounded-lg px-4 py-2 resize-none"
/>


          {/* CATEGORY */}
          <select
  value={categoryId}
  onChange={(e) => {
    setCategoryId(e.target.value);
    setSubcategoryId("");

    axios
      .get(`${BACKEND_URL}/api/subcategories?category=${e.target.value}`)
      .then(res => setSubcategories(res.data));
  }}
  required
  className="w-full border rounded-lg px-4 py-2"
>
  <option value="">Select Category</option>
  {categories.map(cat => (
    <option key={cat._id} value={cat._id}>
      {cat.name}
    </option>
  ))}
</select>

          {/* SUBCATEGORY */}
        <select
  value={subcategoryId}
  onChange={(e) => setSubcategoryId(e.target.value)}
  disabled={!categoryId}
  className="w-full border rounded-lg px-4 py-2"
>
  <option value="">Select Subcategory (optional)</option>
  {subcategories.map(sub => (
    <option key={sub._id} value={sub._id}>
      {sub.name}
    </option>
  ))}
</select>


{/* BRANCH SELECTION */}
<div>
  <label className="block text-sm font-medium mb-2">
    Available in Branches
  </label>

  <div className="space-y-2">
    {branches.map(branch => (
      <label
        key={branch._id}
        className="flex items-center gap-2 text-sm"
      >
        <input
          type="checkbox"
          checked={selectedBranches.includes(branch._id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedBranches(prev => [...prev, branch._id]);
            } else {
              setSelectedBranches(prev =>
                prev.filter(id => id !== branch._id)
              );
            }
          }}
        />
        {branch.name}
      </label>
    ))}
  </div>
</div>

{/* PREORDER SETTINGS */}
<div className="border rounded-lg p-4 space-y-3">
  <label className="flex items-center gap-2 text-sm font-medium">
    <input
      type="checkbox"
      checked={preorderEnabled}
      onChange={(e) => setPreorderEnabled(e.target.checked)}
    />
    Enable Preorder
  </label>

  {preorderEnabled && (
    <>
      <div>
        <label className="text-sm block mb-1">
          Minimum days before pickup
        </label>
        <input
          type="number"
          min="0"
          value={minDays}
          onChange={(e) => setMinDays(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={prepaidRequired}
          onChange={(e) => setPrepaidRequired(e.target.checked)}
        />
        Prepaid order required
      </label>
    </>
  )}
</div>


          {/* TOGGLES */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
              />
              Best Seller
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
              />
              In Stock
            </label>
          </div>
{/* FESTIVAL */}
          <select
  value={festivalId}
  onChange={(e) => setFestivalId(e.target.value)}
  className="w-full border rounded-lg px-4 py-2"
>
  <option value="">No Festival</option>
  {festivals.map(f => (
    <option key={f._id} value={f._id}>
      {f.name}
    </option>
  ))}
</select>


          {/* VARIANTS */}
          <div className="space-y-3">
            <h2 className="font-medium">Variants</h2>

            {variants.map((variant, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
  type="text"
  placeholder="Label (optional)"
  value={variant.label}
  onChange={(e) => updateVariant(i, "label", e.target.value)}
  className="flex-1 border rounded px-3 py-2"
/>


                <input
  type="number"
  step="0.01"
  min="0"
  placeholder="$ Price"
  value={variant.price}
  onChange={(e) => updateVariant(i, "price", e.target.value)}
  className="w-28 border rounded px-3 py-2"
/>

                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="text-red-500 p-2"
                >
                  <FiTrash />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-2 text-sm text-blue-600"
            >
              <FiPlus /> Add Variant
            </button>
          </div>

          {/* IMAGES */}
          {/* IMAGES */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Product Images (max 5)
            </label>

            <div className="grid grid-cols-3 gap-4">
              {/* ADD IMAGE BOX */}
              {images.length < MAX_IMAGES && (
                <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-lg cursor-pointer hover:border-black transition">
                  <FiPlus className="text-2xl text-gray-500" />
                  <span className="text-xs text-gray-500 mt-1">Add Image</span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              )}

              {/* IMAGE PREVIEWS */}
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative h-28 rounded-lg overflow-hidden border"
                >
                  <img
                    src={URL.createObjectURL(img)}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg"
          >
            {loading ? "Uploading..." : "Add Item"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminMenu;
