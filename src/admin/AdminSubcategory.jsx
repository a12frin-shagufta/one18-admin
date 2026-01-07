import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminSubcategory = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/categories`)
      .then(res => setCategories(res.data));
  }, []);

  const fetchSubs = async () => {
    const res = await axios.get(`${BACKEND_URL}/api/subcategories`);
    setSubcategories(res.data);
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const addSubcategory = async () => {
    if (!name || !categoryId) {
      alert("Select category and enter name");
      return;
    }

    await axios.post(`${BACKEND_URL}/api/subcategories`, {
      name,
      category: categoryId,
    });

    setName("");
    setCategoryId("");
    fetchSubs();
  };

  const deleteSubcategory = async (id) => {
  if (!window.confirm("Delete this subcategory?")) return;

  try {
    await axios.delete(`${BACKEND_URL}/api/subcategories/${id}`);
    fetchSubs(); // refresh list
  } catch (err) {
    alert("Failed to delete subcategory");
  }
};


  return (
    <div className="max-w-md bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-3">Subcategories</h2>

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="w-full border px-3 py-2 mb-2"
      >
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Subcategory name"
        className="w-full border px-3 py-2 mb-2"
      />

      <button
        onClick={addSubcategory}
        className="w-full bg-black text-white py-2 rounded"
      >
        Add Subcategory
      </button>

      <ul className="mt-4 space-y-2">
  {subcategories.map((s) => (
    <li
      key={s._id}
      className="flex justify-between items-center border px-3 py-2 rounded"
    >
      <span>
        {s.name}
        <span className="text-xs text-gray-500 ml-2">
          ({s.category?.name})
        </span>
      </span>

      <button
        onClick={() => deleteSubcategory(s._id)}
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

export default AdminSubcategory;
