import { useEffect, useState } from "react";
import axios from "axios";

const AdminFestivalList = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔄 Fetch festivals
  const fetchFestivals = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/festivals`);
      setFestivals(res.data);
    } catch (err) {
      console.error("Failed to fetch festivals", err);
    }
  };

  useEffect(() => {
    fetchFestivals();
  }, []);

  // 🔁 Toggle active/inactive
  const toggleFestival = async (id) => {
    try {
      await axios.patch(`${BACKEND_URL}/api/festivals/toggle/${id}`);
      fetchFestivals(); // refresh list
    } catch (err) {
      alert("Failed to toggle festival");
    }
  };

  // 🗑 Delete festival
  const deleteFestival = async (id) => {
    if (!confirm("Delete this festival?")) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/festivals/${id}`);
      fetchFestivals();
    } catch (err) {
      alert("Failed to delete festival");
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold">Festivals</h2>

      {festivals.length === 0 && (
        <p className="text-gray-500">No festivals created yet.</p>
      )}

      {festivals.map((f) => (
        <div
          key={f._id}
          className="bg-white rounded-xl shadow p-4 flex items-center justify-between"
        >
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <img
              src={f.bannerImage}
              alt={f.name}
              className="w-24 h-16 object-cover rounded-lg"
            />

            <div>
              <h3 className="font-semibold text-lg">{f.name}</h3>
              <p className="text-sm text-gray-500">
                {f.productCount || 0} products
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex gap-3 items-center">
            <button
              onClick={() => toggleFestival(f._id)}
              className={`px-4 py-1 rounded-full text-sm ${
                f.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {f.isActive ? "Active" : "Inactive"}
            </button>

            <button
              onClick={() => deleteFestival(f._id)}
              className="text-red-600 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminFestivalList;
