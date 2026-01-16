import { useEffect, useState } from "react";
import axios from "axios";

const AdminOrders = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("adminToken");

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  }, []);

  const refreshOrders = async () => {
  const res = await axios.get(`${BACKEND_URL}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  setOrders(res.data);
};

// ✅ Activate order manually (pending → preparing)
const activateOrder = async (id) => {
  try {
    await axios.put(
      `${BACKEND_URL}/api/orders/${id}/status`,
      { status: "preparing" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    refreshOrders();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to activate order");
  }
};

// ✅ Book delivery placeholder (no key yet)
const requestLalamoveBooking = async (id) => {
  try {
    await axios.put(
      `${BACKEND_URL}/api/orders/${id}/lalamove/request`,
      {}, // no body needed
      { headers: { Authorization: `Bearer ${token}` } }
    );
    refreshOrders();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to request Lalamove booking");
  }
};


  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>

      {orders.map((order) => (
  <div
    key={order._id}
    className="border rounded-xl p-5 mb-4 bg-white shadow-sm"
  >
    <div className="flex justify-between items-start gap-4 mb-3">
      <div>
        <p className="font-semibold text-lg">
          {order.customer?.firstName} {order.customer?.lastName}
        </p>
        <p className="text-sm text-gray-600">
          📞 {order.customer?.phone || "-"}
        </p>
      </div>

      <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 font-medium">
        {order.fulfillmentType?.toUpperCase()}
      </span>
    </div>
    {order.fulfillmentType === "delivery" && (
  <p className="text-xs mt-1 text-gray-600">
    🚚 Lalamove: <b>{order.lalamoveStatus || "not_booked"}</b>
  </p>
)}


    {/* ✅ DATE + TIME */}
    <div className="text-sm text-gray-800 mb-3">
      <p>
        <b>Date:</b> {order.fulfillmentDate || "-"}
      </p>
      <p>
        <b>Time:</b> {order.fulfillmentTime || "-"}
      </p>
    </div>

    {/* ✅ DELIVERY / PICKUP DETAILS */}
    {order.fulfillmentType === "delivery" ? (
      <div className="text-sm mb-3 bg-gray-50 p-3 rounded-lg">
        <p className="font-semibold mb-1">Delivery Details</p>
        <p><b>Address:</b> {order.customer?.address || "-"}</p>
        <p><b>Apartment:</b> {order.customer?.apartment || "-"}</p>
        <p><b>Postal Code:</b> {order.customer?.postalCode || "-"}</p>
      </div>
    ) : (
      <div className="text-sm mb-3 bg-gray-50 p-3 rounded-lg">
        <p className="font-semibold mb-1">Pickup Details</p>
        <p><b>Location:</b> {order.pickupLocation?.name || "-"}</p>
        <p><b>Address:</b> {order.pickupLocation?.address || "-"}</p>
      </div>
    )}
    {order.pickupLocation && (
  <div className="text-sm mb-3 bg-blue-50 p-3 rounded-lg">
    <p className="font-semibold mb-1">Bakery Pickup Location</p>
    <p><b>Branch:</b> {order.pickupLocation?.name || "-"}</p>
    <p><b>Address:</b> {order.pickupLocation?.address || "-"}</p>
  </div>
)}


    {/* ✅ COMPANY */}
    {order.customer?.company && (
      <p className="text-sm mb-3">
        <b>Company:</b> {order.customer.company}
      </p>
    )}

    {/* ✅ ORDER NOTE */}
    {order.customer?.message && (
      <div className="text-sm mb-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
        <b>📝 Order Instructions:</b> {order.customer.message}
      </div>
    )}

    {/* ✅ ITEMS */}
    <div className="text-sm mb-3">
      <p className="font-semibold mb-2">Items</p>
      {order.items.map((item, i) => (
        <p key={i}>
          ✅ {item.productId?.name || item.name || "Product"}
          {item.variant ? ` (${item.variant})` : ""} × {item.qty}
        </p>
      ))}
    </div>

    {/* ✅ TOTALS */}
    <div className="text-sm border-t pt-3 flex justify-between items-center">
      <div>
        <p><b>Subtotal:</b> ${order.subtotal || 0}</p>
        <p><b>Delivery Fee:</b> ${order.deliveryFee || 0}</p>
      </div>
      <p className="text-lg font-bold">
        Total: ${order.totalAmount || 0}
      </p>
    </div>
    <div className="mt-4 flex gap-3 flex-wrap">
  {/* ✅ Activate order */}
  <button
    onClick={() => activateOrder(order._id)}
    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
  >
    Activate Order
  </button>

  {/* ✅ Book Delivery (only if delivery) */}
  {order.fulfillmentType === "delivery" && (
    <button
      onClick={() => requestLalamoveBooking(order._id)}
      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
    >
      Book Delivery
    </button>
  )}
</div>

  </div>
))}

    </div>
  );
};

export default AdminOrders;
