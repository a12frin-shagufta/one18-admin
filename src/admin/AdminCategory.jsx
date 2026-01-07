import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminCategory = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchCategories = async () => {
    const res = await axios.get(`${BACKEND_URL}/api/categories`);
    setCategories(res.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ ADD CATEGORY (send file to backend)
 
const addCategory = async () => {
  if (!name.trim()) return alert("Enter category name");

  const formData = new FormData();
  formData.append("name", name);

  if (imageFile) {
    formData.append("image", imageFile); // must match upload.single("image")
  }

  try {
    setUploading(true);

    await axios.post(`${BACKEND_URL}/api/categories`, formData);
    // ❌ DO NOT set Content-Type manually

    setName("");
    setImageFile(null);
    setPreview("");
    fetchCategories();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to add category");
  } finally {
    setUploading(false);
  }
};


  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await axios.delete(`${BACKEND_URL}/api/categories/${id}`);
    fetchCategories();
  };

  return (
    <div className="max-w-md bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-3">Categories</h2>

      {/* NAME */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name"
        className="w-full border px-3 py-2 mb-2"
      />

      {/* IMAGE INPUT */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          setImageFile(file);
          setPreview(URL.createObjectURL(file));
        }}
        className="w-full border px-3 py-2 mb-2"
      />

      {/* PREVIEW */}
      {preview && (
        <img
          src={preview}
          alt="preview"
          className="w-full h-32 object-cover rounded mb-2"
        />
      )}

      <button
        onClick={addCategory}
        disabled={uploading}
        className="w-full bg-black text-white py-2 rounded"
      >
        {uploading ? "Uploading..." : "Add Category"}
      </button>

      {/* LIST */}
      <ul className="mt-4 space-y-2">
        {categories.map((c) => (
          <li
            key={c._id}
            className="flex justify-between items-center border px-3 py-2 rounded"
          >
            <span>{c.name}</span>
            <button
              onClick={() => deleteCategory(c._id)}
              className="text-red-600 text-sm"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminCategory;
