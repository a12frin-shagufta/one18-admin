import { useEffect, useState } from "react";
import axios from "axios";
import { formatMoney, CURRENCY, money } from "../utils/currency";


const AdminOrders = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("adminToken");

  const [orders, setOrders] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);


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

  //remove decimal


  const refundOrder = async (id) => {
  if (processingId === id) return;
  if (!window.confirm("Refund this order?")) return;

  try {
    setProcessingId(id);

    await axios.post(
      `${BACKEND_URL}/api/payment/refund/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("✅ Refund successful");
    await refreshOrders();
    setSelectedOrder(null);

  } catch (err) {
    alert(err.response?.data?.message || "Refund failed");
  } finally {
    setProcessingId(null);
  }
};



  const activateOrder = async (id) => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/orders/${id}/status`,
        { status: "preparing" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      refreshOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to activate order");
    }
  };

  // const requestLalamoveBooking = async (id) => {
  //   setProcessingId(id); // Set loading state
  //   try {
  //     const res = await axios.put(
  //       `${BACKEND_URL}/api/orders/${id}/lalamove/request`,
  //       {},
  //       { headers: { Authorization: `Bearer ${token}` } },
  //     );

  //     // ✅ ADD NOTIFICATION
  //     alert("🚀 Lalamove Booked Successfully!");

  //     refreshOrders();
  //   } catch (err) {
  //     alert(
  //       err.response?.data?.message || "Failed to request Lalamove booking",
  //     );
  //   } finally {
  //     setProcessingId(null); // Clear loading state
  //   }
  // };

  const printInvoice = (order) => {
    console.log("PRINT CLICKED", order);

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Popup blocked — allow popups");
      return;
    }

    const address =
  order.fulfillmentType === "delivery"
    ? `
      ${order.customer?.address || ""}<br/>
      ${order.customer?.apartment ? "Apt: " + order.customer.apartment + "<br/>" : ""}
      Postal Code: ${order.customer?.postalCode || ""}
    `
    : order.pickupLocation?.address || "";


    const itemsHTML = (order.items || [])
      .map(
        (item) => `
      <tr>
        <td>
        ${item.name || item.productId?.name || "Item"}
        
          ${item.cakeMessage ? `<br/><span style="font-size:11px;color:#db2777;font-style:italic">🎂 "${item.cakeMessage}"</span>` : ""}
        </td>
        
        <td>${item.qty || 1}</td>
        <td>${CURRENCY}${money(item.price)}</td>


      </tr>
    `,
      )
      .join("");

    const html = `
  <html>
  <head>
    <title>Invoice</title>
    <style>
      body { font-family: Arial; padding:40px }
      table { width:100%; border-collapse: collapse; margin-top:20px }
      th,td { padding:10px; border-bottom:1px solid #ddd }
      
      .total { text-align:right; margin-top:20px; font-weight:bold }
    </style>
  </head>

  <body>
    <h2>ONE18 Bakery</h2>
   <p><b>Order:</b> ${order.orderNumber || order._id}</p>

    <p><b>Date:</b> ${order.fulfillmentDate}</p>
    <p><b>Time:</b> ${order.fulfillmentTime}</p>
    

    <hr/>

<p>
  <b>Customer:</b><br/>
  ${order.customer?.firstName || ""} ${order.customer?.lastName || ""}<br/>
  Phone: ${order.customer?.phone || ""}<br/>
  email: ${order.customer?.email || ""}<br/>
  ${order.customer?.company ? "Company: " + order.customer.company + "<br/>" : ""}
</p>

<p>
  <b>${order.fulfillmentType.toUpperCase()} Address:</b><br/>
  ${address}
</p>



${order.customer?.message ? `<p><b>📝 Note:</b> ${order.customer.message}</p>` : ""}
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <div class="total">
  Subtotal: ${CURRENCY}${money(order.subtotal)}<br/>
  Delivery: ${CURRENCY}${money(order.deliveryFee || 0)}<br/>
  Total: ${CURRENCY}${money(order.totalAmount)}
</div>


    <script>
      window.onload = function(){
        setTimeout(function(){
          window.print();
          window.close();
        }, 300);
      }
    </script>

  </body>
  </html>
  `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const acceptPayNow = async (id) => {
    if (processingId === id) return;

    try {
      setProcessingId(id);

      await axios.put(
        `${BACKEND_URL}/api/payment/paynow/${id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      refreshOrders();
    } finally {
      setProcessingId(null);
    }
  };

  const rejectPayNow = async (id) => {
    if (processingId === id) return;

    try {
      setProcessingId(id);

      await axios.put(
        `${BACKEND_URL}/api/payment/paynow/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      refreshOrders();
    } finally {
      setProcessingId(null);
    }
  };

  const downloadPaymentReport = async () => {
  try {
    const res = await axios.get(
      `${BACKEND_URL}/api/payment/payment-report`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // important
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "payment-report.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (err) {
    alert("Failed to download report");
    console.error(err);
  }
};

const markPaidManually = async (id) => {
  if (processingId === id) return;

  try {
    setProcessingId(id);

    await axios.put(
      `${BACKEND_URL}/api/payment/admin/mark-paid/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("✅ Marked as paid + email sent");
    refreshOrders();

  } catch (err) {
    alert(err.response?.data?.message || "Failed to mark paid");
  } finally {
    setProcessingId(null);
  }
};



  return (
  <div className="p-6 bg-gray-50 min-h-screen">

    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      <button
        onClick={downloadPaymentReport}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        📊 Download Payment Excel
      </button>
    </div>

    {/* Table */}
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="p-4 text-left">Customer</th>
      <th className="p-4 text-left">Method</th>
<th className="p-4 text-left">Date</th>
<th className="p-4 text-left">Time</th>
<th className="p-4 text-left">Ordered At</th>
<th className="p-4 text-left">Payment</th>

            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-left">Phone</th>
            <th className="p-4 text-left">Postal</th>
            <th className="p-4 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-t hover:bg-gray-50">

              {/* Customer */}
              <td className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                  {order.customer?.firstName?.[0] || "U"}
                </div>
                <div>
                  <p className="font-semibold">
                    {order.customer?.firstName} {order.customer?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    #{order.orderNumber || order._id}
                  </p>
                </div>
              </td>

              {/* Branch */}
          {/* Method */}
{/* Method */}
<td className="p-4">
  <span className={`px-2 py-1 rounded-full text-xs font-semibold
    ${order.fulfillmentType === "delivery"
      ? "bg-blue-100 text-blue-700"
      : "bg-purple-100 text-purple-700"}
  `}>
    {order.fulfillmentType === "delivery" ? "Delivery" : "Pickup"}
  </span>
</td>

{/* Date */}
<td className="p-4 text-sm">
  {order.fulfillmentDate || "-"}
</td>

{/* Time */}
<td className="p-4 text-sm">
  {order.fulfillmentTime || "-"}
</td>
<td className="p-4 text-sm">
  {order.createdAt
    ? new Date(order.createdAt).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-"}
</td>



              {/* Payment */}
              <td className="p-4">
                <span className="font-medium">
                  {order.paymentMethod?.toUpperCase()}
                </span>

                <span className={`ml-2 px-2 py-1 text-xs rounded-full
                  ${order.paymentStatus === "paid"
                    ? "bg-green-100 text-green-700"
                    : order.paymentStatus === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"}
                `}>
                  {order.paymentStatus}
                </span>
              </td>

              {/* Email */}
              <td className="p-4">
                {order.customer?.email || "-"}
              </td>

              {/* Phone */}
              <td className="p-4">
                {order.customer?.phone || "-"}
              </td>

              {/* Postal */}
              <td className="p-4">
                {order.customer?.postalCode || "-"}
              </td>

              {/* Action */}
              <td className="p-4">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  View
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Modal */}
    {selectedOrder && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-3xl rounded-xl p-6 max-h-[90vh] overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">
            Order #{selectedOrder.orderNumber}
          </h2>
          <p className="text-sm text-gray-500">
            {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}
          </p>
        </div>
        <button onClick={() => setSelectedOrder(null)}>✕</button>
      </div>
      {/* Date & Time */}
<div className="grid grid-cols-2 gap-4 mb-4">
  <div className="bg-gray-50 p-3 rounded-lg">
    <p className="text-xs text-gray-500">Date</p>
    <p className="font-semibold">
      {selectedOrder.fulfillmentDate || "-"}
    </p>
  </div>

  <div className="bg-gray-50 p-3 rounded-lg">
    <p className="text-xs text-gray-500">Time</p>
    <p className="font-semibold">
      {selectedOrder.fulfillmentTime || "-"}
    </p>
  </div>
</div>


      {/* Method + Lalamove */}
      <div className="flex gap-3 mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold
          ${selectedOrder.fulfillmentType === "delivery"
            ? "bg-blue-100 text-blue-700"
            : "bg-purple-100 text-purple-700"}
        `}>
          {selectedOrder.fulfillmentType.toUpperCase()}
        </span>

        {selectedOrder.fulfillmentType === "delivery" && (
          <span className="text-sm font-medium">
            🚚 {selectedOrder.lalamoveStatus || "not_booked"}
          </span>
        )}
      </div>

      {/* Branch */}
      {selectedOrder.branch && (
        <div className="bg-purple-50 p-4 rounded-lg mb-4">
          <p className="font-semibold mb-1">🏬 Branch</p>
          <p>{selectedOrder.branch.name}</p>
          <p className="text-gray-600">{selectedOrder.branch.address}</p>
        </div>
      )}

      {/* Delivery / Pickup Details */}
      {selectedOrder.fulfillmentType === "delivery" ? (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="font-semibold mb-2">Delivery Details</p>
          <p>Address: {selectedOrder.customer?.address}</p>
          <p>Apartment: {selectedOrder.customer?.apartment}</p>
          <p>Postal: {selectedOrder.customer?.postalCode}</p>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="font-semibold mb-2">Pickup Location</p>
          <p>{selectedOrder.pickupLocation?.name}</p>
          <p>{selectedOrder.pickupLocation?.address}</p>
        </div>
      )}

      {/* Items */}
      <div className="mb-4">
        <p className="font-semibold mb-2">Items</p>
        {selectedOrder.items?.map((item, i) => (
          <div key={i} className="flex justify-between border-b py-2 text-sm">
            <span>
              {item.productId?.name || item.name}
              {item.variant ? ` (${item.variant})` : ""} × {item.qty}
              {item.cakeMessage && (
        <span className="block text-xs text-pink-600 italic mt-0.5">
          🎂 "{item.cakeMessage}"
        </span>
      )}
            </span>
            <span>{formatMoney(item.price * item.qty)}</span>
          </div>
        ))}
      </div>

      {/* Order Note */}
{selectedOrder.customer?.message && (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
    <p className="font-semibold text-amber-800 mb-1">📝 Order Note</p>
    <p className="text-sm text-amber-900">{selectedOrder.customer.message}</p>
  </div>
)}

      {/* Totals */}
      <div className="border-t pt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatMoney(selectedOrder.subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span>{formatMoney(selectedOrder.deliveryFee)}</span>
        </div>

        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total</span>
          <span>{formatMoney(selectedOrder.totalAmount)}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-3 gap-3 mt-6">

        <button
          onClick={() => activateOrder(selectedOrder._id)}
          className="bg-green-600 text-white py-2 rounded"
        >
          Activate
        </button>


       
<button
  disabled={processingId === selectedOrder._id}
  onClick={() => refundOrder(selectedOrder._id)}
  className="bg-red-600 text-white py-2 rounded disabled:opacity-50"
>
  Refund
</button>




        <button
          onClick={() => printInvoice(selectedOrder)}
          className="bg-gray-800 text-white py-2 rounded"
        >
          Print
        </button>

     

        {selectedOrder.paymentStatus !== "paid" && (
  <button
    onClick={() => markPaidManually(selectedOrder._id)}
    className="bg-emerald-600 text-white py-2 rounded"
  >
    Mark Paid + Email
  </button>
)}


      </div>
      {/* Payment Proof (PayNow) */}
{selectedOrder.paymentMethod === "paynow" && selectedOrder.paymentProof && (
  <div className="mt-4">
    <p className="font-semibold mb-2">Payment Proof</p>

    <a
      href={selectedOrder.paymentProof}
      target="_blank"
      rel="noreferrer"
      className="block"
    >
      <img
        src={selectedOrder.paymentProof}
        alt="Payment proof"
        className="w-full max-h-56 object-cover rounded-lg border hover:opacity-90"
      />
    </a>

    <p className="text-xs text-gray-500 mt-1">
      Click image to open full size
    </p>
  </div>
)}


    </div>
  </div>
)}

  </div>
);

};

export default AdminOrders;
