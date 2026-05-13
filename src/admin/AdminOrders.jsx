import { useEffect, useState } from "react";
import axios from "axios";
import { formatMoney, CURRENCY, money } from "../utils/currency";

/* ─────────────── tiny helpers ─────────────── */
const statusColor = {
  paid: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  rejected: "bg-red-100 text-red-700 ring-1 ring-red-200",
  pending: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  refunded: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
};

const Badge = ({ label, colorClass, dot }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}
  >
    {dot && (
      <span
        className={`w-1.5 h-1.5 rounded-full ${colorClass.includes("emerald") ? "bg-emerald-500" : colorClass.includes("red") ? "bg-red-500" : colorClass.includes("amber") ? "bg-amber-500" : "bg-gray-400"}`}
      />
    )}
    {label}
  </span>
);

const Section = ({ title, children }) => (
  <div className="mb-5">
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
      {title}
    </p>
    {children}
  </div>
);

/* ─────────────── component ─────────────── */
const AdminOrders = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("adminToken");

  const [orders, setOrders] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to activate order");
    }
  };

  const printInvoice = async (order) => {
    console.log("PRINT CLICKED", order);
    try {
      await axios.put(
        `${BACKEND_URL}/api/orders/${order._id}/printed`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshOrders();
    } catch (err) {
      console.log(err);
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) { alert("Popup blocked — allow popups"); return; }

    const address =
      order.fulfillmentType === "delivery"
        ? `${order.customer?.address || ""}<br/>${order.customer?.apartment ? "Apt: " + order.customer.apartment + "<br/>" : ""}Postal Code: ${order.customer?.postalCode || ""}`
        : order.pickupLocation?.address || "";

    const itemsHTML = (order.items || [])
      .map((item) => `
        <tr>
          <td>${item.name || item.productId?.name || "Item"}
            ${item.cakeMessage ? `<br/><span style="font-size:11px;color:#db2777;font-style:italic">🎂 "${item.cakeMessage}"</span><br/><span style="font-size:11px;color:#ea580c;font-weight:600">+ Custom wording fee paid</span>` : ""}
          </td>
          <td>${item.qty || 1}</td>
          <td>${CURRENCY}${money(item.price)}</td>
        </tr>`)
      .join("");

    const html = `<html><head><title>Invoice</title><style>body{font-family:Arial;padding:40px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:10px;border-bottom:1px solid #ddd}.total{text-align:right;margin-top:20px;font-weight:bold}</style></head><body>
      <h2>ONE18 Bakery</h2>
      <p><b>Order:</b> ${order.orderNumber || order._id}</p>
      <p><b>Date:</b> ${order.fulfillmentDate}</p>
      <p><b>Time:</b> ${order.fulfillmentTime}</p>
      <hr/>
      <p><b>Customer:</b><br/>${order.customer?.firstName || ""} ${order.customer?.lastName || ""}<br/>Phone: ${order.customer?.phone || ""}<br/>email: ${order.customer?.email || ""}<br/>${order.customer?.company ? "Company: " + order.customer.company + "<br/>" : ""}</p>
      <p><b>${order.fulfillmentType.toUpperCase()} Address:</b><br/>${address}</p>
      ${order.customer?.message ? `<p><b>📝 Note:</b> ${order.customer.message}</p>` : ""}
      <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>${itemsHTML}</tbody></table>
      <div class="total">
        Subtotal: ${CURRENCY}${money(order.subtotal - (order.items || []).reduce((sum, i) => i.cakeMessage && i.cakeMessage.trim() !== "" ? sum + 5 * i.qty : sum, 0))}<br/>
        Cake Wording: ${CURRENCY}${money((order.items || []).reduce((sum, i) => i.cakeMessage && i.cakeMessage.trim() !== "" ? sum + 5 * i.qty : sum, 0))}<br/>
        Delivery: ${CURRENCY}${money(order.deliveryFee || 0)}<br/>
        Total: ${CURRENCY}${money(order.totalAmount)}
      </div>
      <script>window.onload=function(){setTimeout(function(){window.print();window.close();},300);}</script>
    </body></html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const acceptPayNow = async (id) => {
    if (processingId === id) return;
    try {
      setProcessingId(id);
      await axios.put(`${BACKEND_URL}/api/payment/paynow/${id}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
      refreshOrders();
    } finally { setProcessingId(null); }
  };

  const rejectPayNow = async (id) => {
    if (processingId === id) return;
    try {
      setProcessingId(id);
      await axios.put(`${BACKEND_URL}/api/payment/paynow/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      refreshOrders();
    } finally { setProcessingId(null); }
  };

  const downloadPaymentReport = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/payment/payment-report`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "payment-report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download report");
    }
  };

  const markPaidManually = async (id) => {
    if (processingId === id) return;
    try {
      setProcessingId(id);
      await axios.put(`${BACKEND_URL}/api/payment/admin/mark-paid/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("✅ Marked as paid + email sent");
      refreshOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark paid");
    } finally { setProcessingId(null); }
  };

  /* ── filtering ── */
  const filtered = orders.filter((o) => {
    const name = `${o.customer?.firstName} ${o.customer?.lastName}`.toLowerCase();
    const id = (o.orderNumber || o._id || "").toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || id.includes(search.toLowerCase());
    const matchMethod = filterMethod === "all" || o.fulfillmentType === filterMethod;
    return matchSearch && matchMethod;
  });

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
      className="min-h-screen bg-[#F7F8FA]"
    >
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Orders</h1>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} of {orders.length} orders</p>
        </div>
        <button
          onClick={downloadPaymentReport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Excel
        </button>
      </div>

      <div className="px-8 py-6">
        {/* ── Filters ── */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or order ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          {["all", "delivery", "pickup"].map((m) => (
            <button
              key={m}
              onClick={() => setFilterMethod(m)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize
                ${filterMethod === m ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
            >
              {m === "all" ? "All" : m === "delivery" ? "🚚 Delivery" : "🏬 Pickup"}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Customer", "Fulfillment", "Date & Time", "Ordered At", "Payment", "Print", "Contact", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-400 text-sm">
                    No orders match your search.
                  </td>
                </tr>
              )}
              {filtered.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                        {order.customer?.firstName?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {order.customer?.firstName} {order.customer?.lastName}
                        </p>
                        <p className="text-xs text-gray-400">#{order.orderNumber || order._id?.slice(-6)}</p>
                      </div>
                    </div>
                  </td>

                  {/* Fulfillment */}
                  <td className="px-4 py-3">
                    <Badge
                      label={order.fulfillmentType === "delivery" ? "🚚 Delivery" : "🏬 Pickup"}
                      colorClass={order.fulfillmentType === "delivery" ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100" : "bg-purple-50 text-purple-700 ring-1 ring-purple-100"}
                    />
                  </td>

                  {/* Date & Time */}
                  <td className="px-4 py-3">
                    <p className="text-gray-800 font-medium text-sm">{order.fulfillmentDate || "—"}</p>
                    <p className="text-xs text-gray-400">{order.fulfillmentTime || "—"}</p>
                  </td>

                  {/* Ordered At */}
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </td>

                  {/* Payment */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        {order.paymentMethod}
                      </span>
                      <Badge
                        dot
                        label={order.paymentStatus}
                        colorClass={statusColor[order.paymentStatus] || statusColor.pending}
                      />
                    </div>
                  </td>

                  {/* Print */}
                  <td className="px-4 py-3">
                    <Badge
                      dot
                      label={order.printStatus || "pending"}
                      colorClass={order.printStatus === "printed" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"}
                    />
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-600 truncate max-w-[160px]">{order.customer?.email || "—"}</p>
                    <p className="text-xs text-gray-400">{order.customer?.phone || "—"}</p>
                  </td>

                  {/* View btn */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════ MODAL ══════════════ */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-end z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    label={selectedOrder.fulfillmentType === "delivery" ? "🚚 Delivery" : "🏬 Pickup"}
                    colorClass={selectedOrder.fulfillmentType === "delivery" ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100" : "bg-purple-50 text-purple-700 ring-1 ring-purple-100"}
                  />
                  <Badge
                    dot
                    label={selectedOrder.paymentStatus}
                    colorClass={statusColor[selectedOrder.paymentStatus] || statusColor.pending}
                  />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Order #{selectedOrder.orderNumber}</h2>
                <p className="text-sm text-gray-500">
                  {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-lg transition-colors mt-1"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 flex-1 space-y-5">

              {/* Date / Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Date</p>
                  <p className="font-semibold text-gray-800">{selectedOrder.fulfillmentDate || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Time</p>
                  <p className="font-semibold text-gray-800">{selectedOrder.fulfillmentTime || "—"}</p>
                </div>
              </div>

              {/* Customer info */}
              <Section title="Customer">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-1.5 text-sm">
                  <p className="font-semibold text-gray-800">{selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}</p>
                  {selectedOrder.customer?.email && <p className="text-gray-500">{selectedOrder.customer.email}</p>}
                  {selectedOrder.customer?.phone && <p className="text-gray-500">{selectedOrder.customer.phone}</p>}
                  {selectedOrder.customer?.company && <p className="text-gray-500 italic">{selectedOrder.customer.company}</p>}
                </div>
              </Section>

              {/* Address */}
              <Section title={selectedOrder.fulfillmentType === "delivery" ? "Delivery Address" : "Pickup Location"}>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-700 space-y-1">
                  {selectedOrder.fulfillmentType === "delivery" ? (
                    <>
                      <p>{selectedOrder.customer?.address}</p>
                      {selectedOrder.customer?.apartment && <p>Apt: {selectedOrder.customer.apartment}</p>}
                      <p className="text-gray-400">Postal: {selectedOrder.customer?.postalCode}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">{selectedOrder.pickupLocation?.name}</p>
                      <p className="text-gray-500">{selectedOrder.pickupLocation?.address}</p>
                    </>
                  )}
                </div>
              </Section>

              {/* Branch */}
              {selectedOrder.branch && (
                <Section title="Branch">
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 text-sm">
                    <p className="font-semibold text-purple-800">{selectedOrder.branch.name}</p>
                    <p className="text-purple-600">{selectedOrder.branch.address}</p>
                  </div>
                </Section>
              )}

              {/* Items */}
              <Section title={`Items (${selectedOrder.items?.length || 0})`}>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className={`px-4 py-3 flex justify-between items-start gap-4 text-sm ${i !== 0 ? "border-t border-gray-50" : ""}`}>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {item.productId?.name || item.name}
                          {item.variant ? <span className="text-gray-400 font-normal"> ({item.variant})</span> : ""}
                          <span className="text-gray-400 font-normal ml-1">× {item.qty}</span>
                        </p>
                        {item.cakeMessage && (
                          <div className="mt-1 space-y-0.5">
                            <span className="block text-xs text-pink-600 italic">🎂 "{item.cakeMessage}"</span>
                            <span className="block text-xs text-orange-600 font-medium">+ Custom wording fee paid</span>
                          </div>
                        )}
                      </div>
                      <span className="font-semibold text-gray-700 shrink-0">{formatMoney(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Note */}
              {selectedOrder.customer?.message && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-amber-800 mb-1">📝 Order Note</p>
                  <p className="text-amber-900">{selectedOrder.customer.message}</p>
                </div>
              )}

              {/* Totals */}
              <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100 text-sm">
                  <div className="flex justify-between px-4 py-2.5 text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatMoney(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.items?.some((i) => i.cakeMessage && i.cakeMessage.trim() !== "") && (
                    <div className="flex justify-between px-4 py-2.5 text-orange-600">
                      <span>Cake Wording</span>
                      <span>
                        {formatMoney(selectedOrder.items.reduce((sum, i) =>
                          i.cakeMessage && i.cakeMessage.trim() !== "" ? sum + 5 * i.qty : sum, 0))}
                      </span>
                    </div>
                  )}
                  {selectedOrder.deliveryFee > 0 && (
                    <div className="flex justify-between px-4 py-2.5 text-gray-600">
                      <span>Delivery Fee</span>
                      <span>{formatMoney(selectedOrder.deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between px-4 py-3 font-bold text-gray-900 text-base bg-white">
                    <span>Total</span>
                    <span>{formatMoney(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment proof */}
              {selectedOrder.paymentMethod === "paynow" && selectedOrder.paymentProof && (
                <Section title="Payment Proof">
                  <a href={selectedOrder.paymentProof} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity">
                    <img src={selectedOrder.paymentProof} alt="Payment proof" className="w-full max-h-56 object-cover" />
                  </a>
                  <p className="text-xs text-gray-400 mt-1">Tap to view full size</p>
                </Section>
              )}
            </div>

            {/* ── Sticky action bar ── */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <button
                  onClick={() => activateOrder(selectedOrder._id)}
                  className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  ✅ Activate
                </button>

                <button
                  disabled={processingId === selectedOrder._id}
                  onClick={() => refundOrder(selectedOrder._id)}
                  className="flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  ↩ Refund
                </button>

                <button
                  onClick={() => printInvoice(selectedOrder)}
                  className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  🖨 Print
                </button>
              </div>

              {selectedOrder.paymentStatus !== "paid" && (
                <button
                  onClick={() => markPaidManually(selectedOrder._id)}
                  disabled={processingId === selectedOrder._id}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  💳 Mark Paid + Send Email
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;