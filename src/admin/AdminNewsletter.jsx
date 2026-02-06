import { useEffect, useState } from "react";
import axios from "axios";

const AdminNewsletter = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("adminToken");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadSubscribers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BACKEND_URL}/api/newsletter/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setItems(res.data.items || []);
    } catch (err) {
      alert("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const filtered = items.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">
          Newsletter Subscribers
        </h1>

        <button
          onClick={loadSubscribers}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black"
        >
          Refresh
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading subscribers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No subscribers found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Source</th>
                <th className="p-3">Subscribed At</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((s) => (
                <tr key={s._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">
                    {s.email}
                  </td>

                  <td className="p-3">
                    {s.source || "footer"}
                  </td>

                  <td className="p-3 text-gray-600">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* COUNT */}
      {!loading && (
        <p className="mt-4 text-sm text-gray-600">
          Total: {filtered.length} subscribers
        </p>
      )}
    </div>
  );
};

export default AdminNewsletter;
