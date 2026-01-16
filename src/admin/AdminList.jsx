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

      setMenu(res.data || []);
    } catch (err) {
      console.error("ADMIN MENU FETCH ERROR:", err.response?.data || err);
      setMenu([]);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    await axios.delete(`${BACKEND_URL}/api/menu/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    fetchMenu();
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Menu Items</h1>

      <div className="space-y-3">
        {menu.map((item) => (
          <div
            key={item._id}
            className="bg-white p-3 sm:p-4 rounded-xl shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            {/* LEFT */}
            <div className="flex items-center gap-3 sm:gap-4">
              <img
                src={item.images?.[0]}
                alt={item.name}
                className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border"
              />

              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base truncate">
                  {item.name}
                </h3>

                <p className="text-xs sm:text-sm text-gray-500 capitalize truncate">
                  {item.category?.name || "No Category"}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 sm:gap-3 justify-end sm:justify-start">
              <button
                onClick={() =>
                  (window.location.href = `/admin/edit/${item._id}`)
                }
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-600 text-sm hover:bg-blue-200 transition"
              >
                <FiEdit className="text-base" />
                <span className="hidden sm:inline">Edit</span>
              </button>

              <button
                onClick={() => deleteItem(item._id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-100 text-red-600 text-sm hover:bg-red-200 transition"
              >
                <FiTrash2 className="text-base" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        ))}

        {/* EMPTY STATE */}
        {menu.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            No menu items found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminList;
