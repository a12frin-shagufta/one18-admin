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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>

      {orders.map(order => (
        <div
          key={order._id}
          className="border rounded-lg p-4 mb-4 bg-white shadow"
        >
          <div className="flex justify-between mb-2">
            <div>
     <p className="font-medium">
  {order.customer?.name || "Guest Customer"}
</p>

<p className="text-sm text-gray-500">
  {order.customer?.phone || "No phone"}
</p>

<p>
  <b>Pickup Time:</b> {order.pickupLocation?.pickupTime}
</p>


            </div>

            <span className="px-3 py-1 text-sm rounded bg-blue-100 text-blue-700">
             {order.orderType?.toUpperCase() || "UNKNOWN"}

            </span>
          </div>

          {/* DELIVERY / PICKUP INFO */}
          {order.orderType === "delivery" ? (
            <div className="text-sm mb-2">
              <p><b>Address:</b> {order.deliveryAddress?.address || "-"}</p>
<p><b>Postal Code:</b> {order.deliveryAddress?.postalCode || "-"}</p>

            </div>
          ) : (
            <div className="text-sm mb-2">
             <p><b>Pickup:</b> {order.pickupLocation?.name || "Store Pickup"}</p>

            </div>
          )}

          {/* ITEMS */}
          <div className="text-sm">
            {order.items.map((item, i) => (
              <p key={i}>
               {item.productId?.name || "Product"} ({item.variant}) × {item.qty}

              </p>
            ))}
          </div>

          <div className="mt-2 font-semibold">
            Total: ${order.totalAmount}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminOrders;
