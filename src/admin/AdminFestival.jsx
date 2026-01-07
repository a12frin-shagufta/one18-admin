import { useState } from "react";
import axios from "axios";

const AdminFestival = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [name, setName] = useState("");
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Festival name is required");
      return;
    }

    if (!banner) {
      alert("Festival banner is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("banner", banner); // 🔥 MUST MATCH upload.single("banner")

    try {
      setLoading(true);

      await axios.post(`${BACKEND_URL}/api/festivals`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Festival created 🎉");
      setName("");
      setBanner(null);
    } catch (err) {
      console.error(err);
      alert("Failed to create festival");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Create Festival</h1>

      <form onSubmit={submitHandler} className="space-y-4">
        {/* FESTIVAL NAME */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-4 py-2"
          placeholder="Festival name"
        />

        {/* FESTIVAL BANNER */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setBanner(e.target.files[0])}
          className="w-full border rounded px-4 py-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? "Uploading..." : "Create Festival"}
        </button>
      </form>
    </div>
  );
};

export default AdminFestival;
