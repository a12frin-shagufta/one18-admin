

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
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err));
  }, []);

  const refreshOrders = async () => {
    const res = await axios.get(`${BACKEND_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setOrders(res.data);
  };

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

  const requestLalamoveBooking = async (id) => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/orders/${id}/lalamove/request`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to request Lalamove booking");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-xl p-4 md:p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div>
                  <p className="font-semibold text-lg">
                    {order.customer?.firstName} {order.customer?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    📞 {order.customer?.phone || "-"}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 font-medium self-start sm:self-auto">
                    {order.fulfillmentType?.toUpperCase()}
                  </span>
                  {order.fulfillmentType === "delivery" && (
                    <p className="text-xs text-gray-600">
                      🚚 <b>{order.lalamoveStatus || "not_booked"}</b>
                    </p>
                  )}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                <div className="text-sm text-gray-800">
                  <p className="font-medium">Date</p>
                  <p>{order.fulfillmentDate || "-"}</p>
                </div>
                <div className="text-sm text-gray-800">
                  <p className="font-medium">Time</p>
                  <p>{order.fulfillmentTime || "-"}</p>
                </div>
              </div>

              {/* Delivery/Pickup Details */}
              {order.fulfillmentType === "delivery" ? (
                <div className="text-sm mb-4 bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold mb-2">Delivery Details</p>
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {order.customer?.address || "-"}
                    </p>
                    <p>
                      <span className="font-medium">Apartment:</span>{" "}
                      {order.customer?.apartment || "-"}
                    </p>
                    <p>
                      <span className="font-medium">Postal Code:</span>{" "}
                      {order.customer?.postalCode || "-"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-sm mb-4 bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold mb-2">Pickup Details</p>
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium">Location:</span>{" "}
                      {order.pickupLocation?.name || "-"}
                    </p>
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {order.pickupLocation?.address || "-"}
                    </p>
                  </div>
                </div>
              )}

              {/* Bakery Pickup Location */}
              {order.pickupLocation && (
                <div className="text-sm mb-4 bg-blue-50 p-3 rounded-lg">
                  <p className="font-semibold mb-2">Bakery Pickup Location</p>
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium">Branch:</span>{" "}
                      {order.pickupLocation?.name || "-"}
                    </p>
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {order.pickupLocation?.address || "-"}
                    </p>
                  </div>
                </div>
              )}

              {/* Company */}
              {order.customer?.company && (
                <div className="text-sm mb-4">
                  <p className="font-medium">Company</p>
                  <p>{order.customer.company}</p>
                </div>
              )}

              {/* Order Note */}
              {order.customer?.message && (
                <div className="text-sm mb-4 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <p className="font-medium mb-1">📝 Order Instructions</p>
                  <p>{order.customer.message}</p>
                </div>
              )}

              {/* Items */}
              <div className="text-sm mb-4">
                <p className="font-semibold mb-2">Items</p>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {item.productId?.name || item.name || "Product"}
                          {item.variant ? ` (${item.variant})` : ""}
                        </p>
                      </div>
                      <p className="font-medium">× {item.qty}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Subtotal</span>
                  <span className="text-sm">${order.subtotal || 0}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Delivery Fee</span>
                  <span className="text-sm">${order.deliveryFee || 0}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold">
                    ${order.totalAmount || 0}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => activateOrder(order._id)}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors flex-1"
                >
                  Activate Order
                </button>

                {order.fulfillmentType === "delivery" && (
                  <button
                    onClick={() => requestLalamoveBooking(order._id)}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors flex-1"
                  >
                    Book Delivery
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;