import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiEye, FiEyeOff, FiCopy } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const AdminList = () => {
  const [menu, setMenu] = useState([]);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const adminToken = localStorage.getItem("adminToken");

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/menu/admin`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setMenu(res.data || []);
    } catch (err) {
      console.error("ADMIN MENU FETCH ERROR:", err.response?.data || err);
      setMenu([]);
    }
  };

  useEffect(() => { fetchMenu(); }, []);

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await axios.delete(`${BACKEND_URL}/api/menu/${id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    fetchMenu();
  };

  // ✅ Single-field PATCH. This used to send a full PUT that omitted addOns,
  // subcategory and festival — so toggling publish silently ERASED the add-on
  // rules (e.g. the 12pc croissant bundle config) on that item.
  const togglePublish = async (item) => {
    try {
      const res = await axios.patch(
        `${BACKEND_URL}/api/menu/${item._id}/publish`,
        { isAvailable: !item.isAvailable },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      setMenu((prev) =>
        prev.map((m) =>
          m._id === item._id ? { ...m, isAvailable: res.data.isAvailable } : m,
        ),
      );
    } catch (err) {
      console.error("TOGGLE PUBLISH ERROR:", err.response?.data || err);
      alert(err.response?.data?.message || "Could not change publish state");
    }
  };

  // ✅ Duplicate: server copies variants, add-on rules, branches, preorder and
  // images into a new UNPUBLISHED item, then we jump straight to editing it.
  const duplicateItem = async (item) => {
    if (duplicatingId) return;
    setDuplicatingId(item._id);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/menu/${item._id}/duplicate`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );
      const copy = res.data.item;
      await fetchMenu();
      navigate(`/admin/edit/${copy._id}`);
    } catch (err) {
      console.error("DUPLICATE ERROR:", err.response?.data || err);
      alert(err.response?.data?.message || "Could not duplicate this item");
    } finally {
      setDuplicatingId(null);
    }
  };

  // ✅ NEW: toggle promo eligibility
  const togglePromo = async (item) => {
    try {
      const res = await axios.patch(
        `${BACKEND_URL}/api/promo/toggle/${item._id}`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      setMenu((prev) =>
        prev.map((m) =>
          m._id === item._id
            ? { ...m, isPromoEligible: res.data.isPromoEligible }
            : m
        )
      );
    } catch (err) {
      console.error("TOGGLE PROMO ERROR:", err.response?.data || err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Menu Items</h1>

      <div className="space-y-3">
        {menu.map((item) => (
          <div
            key={item._id}
            className={`bg-white p-3 sm:p-4 rounded-xl shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
              !item.isAvailable ? "opacity-60" : ""
            }`}
          >
            {/* LEFT */}
            <div className="flex items-center gap-3 sm:gap-4">
              <img
                src={item.images?.[0]}
                alt={item.name}
                className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm sm:text-base truncate">
                    {item.name}
                  </h3>
                  {/* Published badge */}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.isAvailable ? "Published" : "Unpublished"}
                  </span>
                  {/* ✅ Promo badge */}
                  {item.isPromoEligible && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">
                      🎁 Promo
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 capitalize truncate">
                  {item.category?.name || "No Category"}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 flex-wrap justify-end sm:justify-start">
              {/* Publish / Unpublish */}
              <button
                onClick={() => togglePublish(item)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition ${
                  item.isAvailable
                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {item.isAvailable ? (
                  <FiEyeOff className="text-base" />
                ) : (
                  <FiEye className="text-base" />
                )}
                <span className="hidden sm:inline">
                  {item.isAvailable ? "Unpublish" : "Publish"}
                </span>
              </button>

              {/* ✅ Promo toggle */}
              <button
                onClick={() => togglePromo(item)}
                title={item.isPromoEligible ? "Remove from promo" : "Add to Buy 4 Get 1 Free"}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition ${
                  item.isPromoEligible
                    ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <span>🎁</span>
                <span className="hidden sm:inline">
                  {item.isPromoEligible ? "Promo On" : "Promo Off"}
                </span>
              </button>

              {/* ✅ Duplicate — copies add-on rules, variants, branches, images
                   into a new draft, then opens it for editing */}
              <button
                onClick={() => duplicateItem(item)}
                disabled={duplicatingId === item._id}
                title="Make a copy of this item as an unpublished draft"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-100 text-purple-600 text-sm hover:bg-purple-200 transition disabled:opacity-50 disabled:cursor-wait"
              >
                <FiCopy className="text-base" />
                <span className="hidden sm:inline">
                  {duplicatingId === item._id ? "Copying..." : "Duplicate"}
                </span>
              </button>

              {/* Edit */}
              <button
                onClick={() => navigate(`/admin/edit/${item._id}`)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-100 text-blue-600 text-sm hover:bg-blue-200 transition"
              >
                <FiEdit className="text-base" />
                <span className="hidden sm:inline">Edit</span>
              </button>

              {/* Delete */}
              <button
                onClick={() => deleteItem(item._id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-100 text-red-600 text-sm hover:bg-red-200 transition"
              >
                <FiTrash2 className="text-base" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        ))}

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