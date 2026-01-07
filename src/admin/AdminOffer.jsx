import { useEffect, useState } from "react";
import axios from "axios";

const AdminOffer = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [title, setTitle] = useState("");
  const [type, setType] = useState("flat");
  const [value, setValue] = useState("");
  const [offers, setOffers] = useState([]);

  // 🔁 fetch existing offers
  const fetchOffers = async () => {
    const res = await axios.get(`${BACKEND_URL}/api/offers`);
    setOffers(res.data);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    await axios.post(`${BACKEND_URL}/api/offers`, {
      title,
      type,
      value,
    });

    setTitle("");
    setValue("");

    fetchOffers(); // 🔥 refresh list
    alert("Offer created ✅");
  };

  return (
    <div className="space-y-8">

      {/* CREATE OFFER */}
      <form onSubmit={submitHandler} className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-bold">Create Offer</h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Offer name (Christmas / Diwali)"
          className="border p-2 w-full rounded"
          required
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 w-full rounded"
        >
          <option value="flat">Flat Amount (₹)</option>
          <option value="percent">Percentage (%)</option>
        </select>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Discount value"
          className="border p-2 w-full rounded"
          required
        />

        <button className="bg-black text-white px-6 py-2 rounded">
          Save Offer
        </button>
      </form>

      {/* EXISTING OFFERS */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Existing Offers</h2>

        {offers.length === 0 && (
          <p className="text-gray-500">No offers created yet</p>
        )}

        <div className="space-y-3">
          {offers.map((offer) => (
            <div
              key={offer._id}
              className="flex justify-between items-center border p-4 rounded-lg"
            >
              <div>
                <h3 className="font-medium">{offer.title}</h3>
                <p className="text-sm text-gray-600">
                  {offer.type === "flat"
                    ? `₹${offer.value} OFF`
                    : `${offer.value}% OFF`}
                </p>
              </div>

              <span className="text-xs px-3 py-1 rounded bg-green-100 text-green-700">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOffer;
