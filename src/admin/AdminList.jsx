import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const AdminList = () => {
  const [menu, setMenu] = useState([]);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const adminToken = localStorage.getItem("adminToken");


const fetchMenu = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/menu/admin`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    setMenu(res.data || []); // safety
  } catch (err) {
    console.error("ADMIN MENU FETCH ERROR:", err.response?.data || err);
    setMenu([]); // prevent crash
  }
};


  useEffect(() => {
    fetchMenu();
  }, []);

  /* ======================
     DELETE
  ====================== */
  const deleteItem = async (id) => {
    if (!confirm("Delete this item?")) return;

  await axios.delete(`${BACKEND_URL}/api/menu/${id}`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  },
});

    fetchMenu();
  };

  const toggleFestival = async (id) => {
  await axios.patch(`${BACKEND_URL}/api/festivals/toggle/${id}`);
  fetchFestivals(); // 🔥 REQUIRED
};


  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Menu Items</h1>

      <div className="space-y-3">
        {menu.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between bg-white p-3 rounded-lg shadow"
          >
            <div className="flex items-center gap-4">
              <img
  src={item.images?.[0]}
  alt={item.name}
  className="w-16 h-16 object-cover rounded"
/>


              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500 capitalize">
                  {item.category?.name}

                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3">
              <button
                onClick={() =>
                  window.location.href = `/admin/edit/${item._id}`
                }
                className="p-2 rounded bg-blue-100 text-blue-600"
              >
                <FiEdit />
              </button>
              

              <button
                onClick={() => deleteItem(item._id)}
                className="p-2 rounded bg-red-100 text-red-600"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminList;
