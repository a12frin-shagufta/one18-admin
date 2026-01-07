import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FiPlus, FiTrash } from "react-icons/fi";

const MAX_IMAGES = 5;

const EditMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [variants, setVariants] = useState([{ label: "", price: "" }]);
  const [removedImages, setRemovedImages] = useState([]);

  const token = localStorage.getItem("adminToken");

  // 🔥 IMPORTANT: two separate states
  const [existingImages, setExistingImages] = useState([]); // URLs from DB
  const [images, setImages] = useState([]); // new Files

  const [isBestSeller, setIsBestSeller] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [loading, setLoading] = useState(false);

  const [description, setDescription] = useState("");

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [festivals, setFestivals] = useState([]);
  const [festivalId, setFestivalId] = useState("");
  // BRANCHES
const [branches, setBranches] = useState([]);
const [selectedBranches, setSelectedBranches] = useState([]);

// PREORDER
const [preorderEnabled, setPreorderEnabled] = useState(false);
const [minDays, setMinDays] = useState(0);
const [prepaidRequired, setPrepaidRequired] = useState(false);


  /* ======================
     FETCH ITEM
  ====================== */

  useEffect(() => {
  axios
    .get(`${BACKEND_URL}/api/branches`)
    .then(res => setBranches(res.data))
    .catch(console.error);
}, []);

useEffect(() => {
  axios
    .get(`${BACKEND_URL}/api/categories`)
    .then(res => setCategories(res.data))
    .catch(console.error);
}, []);



  useEffect(() => {
  axios.get(`${BACKEND_URL}/api/festivals`)
    .then(res => {
      setFestivals(res.data); // ✅ show ALL festivals
    })
    .catch(console.error);
}, []);


  useEffect(() => {
  axios.get(`${BACKEND_URL}/api/menu/${id}`).then((res) => {
    const item = res.data;

    setName(item.name || "");
    setDescription(item.description || "");
    setCategoryId(item.category?._id || "");
    setSubcategoryId(item.subcategory?._id || "");
    setFestivalId(item.festival?._id || "");

    setVariants(
      item.variants?.length ? item.variants : [{ label: "", price: "" }]
    );

    setIsBestSeller(!!item.isBestSeller);
    setInStock(item.inStock !== false);
    setExistingImages(item.images || []);

    // ✅ ADD THESE
    setSelectedBranches(item.branches || []);

    if (item.preorder?.enabled) {
      setPreorderEnabled(true);
      setMinDays(item.preorder.minDays || 0);
      setPrepaidRequired(!!item.preorder.prepaidRequired);
    }

    if (item.category?._id) {
      axios
        .get(`${BACKEND_URL}/api/subcategories?category=${item.category._id}`)
        .then((res) => setSubcategories(res.data));
    }
  });
}, [id]);


  /* ======================
     IMAGE HANDLERS
  ====================== */
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) =>
      [...prev, ...files].slice(0, MAX_IMAGES - existingImages.length)
    );
  };

  const removeNewImage = (i) => {
    setImages(images.filter((_, index) => index !== i));
  };

  /* ======================
     VARIANTS
  ====================== */
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

  /* ======================
     UPDATE SUBMIT
  ====================== */
  console.log("variants being sent:", variants);


const submitHandler = async (e) => {
  e.preventDefault();

  // 🔥 CLEAN VARIANTS (VERY IMPORTANT)
  const cleanedVariants = variants
  .filter(v => v.price !== "" && Number(v.price) > 0)


    .map(v => ({
      label: v.label?.trim() || "",
      price: Number(v.price),
    }));

  if (cleanedVariants.length === 0) {
    alert("At least one variant price is required");
    return;
  }

  const data = new FormData();

  data.append("name", name.trim());
  data.append("description", description || "");
  data.append("category", categoryId);
  data.append("variants", JSON.stringify(cleanedVariants));
  data.append("isBestSeller", isBestSeller);
  data.append("inStock", inStock);
  data.append("removedImages", JSON.stringify(removedImages || []));

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


  // ✅ SUBCATEGORY (ONLY IF EXISTS)
  if (subcategoryId) {
    data.append("subcategory", subcategoryId);
  }

  // ✅ FESTIVAL (ONLY IF SELECTED)
  if (festivalId) {
    data.append("festival", festivalId);
  }

  // ✅ NEW IMAGES ONLY
  images.forEach(img => {
    data.append("images", img);
  });

  try {
    setLoading(true);

    await axios.put(
      `${BACKEND_URL}/api/menu/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Menu item updated ✅");
    navigate("/admin/menu");
  } catch (err) {
    console.error("UPDATE ERROR:", err.response?.data || err);
    alert("Update failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Edit Menu Item</h1>

      <form onSubmit={submitHandler} className="space-y-5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-4 py-2 rounded"
          required
        />

        <textarea
          placeholder="Product description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border rounded px-4 py-2 resize-none"
        />

        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setSubcategoryId("");

            axios
              .get(
                `${BACKEND_URL}/api/subcategories?category=${e.target.value}`
              )
              .then((res) => setSubcategories(res.data));
          }}
          required
          className="w-full border rounded px-4 py-2"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={subcategoryId}
          onChange={(e) => setSubcategoryId(e.target.value)}
          disabled={!categoryId}
          className="w-full border rounded px-4 py-2"
        >
          <option value="">Select Subcategory (optional)</option>
          {subcategories.map((sub) => (
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
        {/* TOGGLES */}
<div className="flex gap-6 text-sm">
  <label className="flex gap-2 items-center">
    <input
      type="checkbox"
      checked={isBestSeller}
      onChange={(e) => setIsBestSeller(e.target.checked)}
    />
    Best Seller
  </label>

  <label className="flex gap-2 items-center">
    <input
      type="checkbox"
      checked={inStock}
      onChange={(e) => setInStock(e.target.checked)}
    />
    In Stock
  </label>
</div>

{/* FESTIVAL */}
<div>
  <label className="block text-sm font-medium mb-1">
    Festival (optional)
  </label>
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
</div>

        {/* VARIANTS */}
        {variants.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={v.label}
              onChange={(e) => updateVariant(i, "label", e.target.value)}
              className="flex-1 border px-2 py-1"
            />
            <input
  type="number"
  step="0.01"
  min="0"
  value={v.price}
  onChange={(e) => updateVariant(i, "price", e.target.value)}
  className="w-24 border px-2 py-1"
/>

            <button
              type="button"
              onClick={() => removeVariant(i)}
              className="text-red-500"
            >
              <FiTrash />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addVariant}
          className="text-blue-600 text-sm flex gap-1"
        >
          <FiPlus /> Add Variant
        </button>

        {/* IMAGES */}
        <div className="grid grid-cols-3 gap-4">
          {/* EXISTING IMAGES (Cloudinary URLs) */}
          {existingImages.map((img, i) => (
            <div key={`old-${i}`} className="relative h-24 border">
              <img
                src={img}
                className="w-full h-full object-cover"
                alt="existing"
              />

              <button
                type="button"
                onClick={() => {
                  setExistingImages((prev) =>
                    prev.filter((_, idx) => idx !== i)
                  );
                  setRemovedImages((prev) => [...prev, img]);
                }}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5"
              >
                ✕
              </button>
            </div>
          ))}

          {/* NEW IMAGE PREVIEWS */}
          {images.map((img, i) => (
            <div key={`new-${i}`} className="relative h-24 border">
              <img
                src={URL.createObjectURL(img)}
                className="w-full h-full object-cover"
                alt="new"
              />
              <button
                type="button"
                onClick={() => removeNewImage(i)}
                className="absolute top-1 right-1 bg-black text-white text-xs rounded-full w-5 h-5"
              >
                ✕
              </button>
            </div>
          ))}

          {/* ADD IMAGE */}
          {existingImages.length + images.length < MAX_IMAGES && (
            <label className="h-24 border-2 border-dashed flex items-center justify-center cursor-pointer">
              <FiPlus />
              <input type="file" hidden multiple onChange={handleImageSelect} />
            </label>
          )}
        </div>

        <button
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loading ? "Updating..." : "Update Item"}
        </button>
      </form>
    </div>
  );
};

export default EditMenu;
