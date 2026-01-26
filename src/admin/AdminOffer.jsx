import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Tag,
  Package,
  Filter,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

/* ✅ Checkbox Multi Select (Mobile friendly) */
const CheckboxMultiSelect = ({
  title,
  items = [],
  selected = [],
  setSelected,
  placeholder = "Search...",
  error = "",
}) => {
  const [q, setQ] = useState("");

  const safeSelected = Array.isArray(selected) ? selected : [];

  const filtered = useMemo(() => {
    return items.filter((it) =>
      (it.name || "").toLowerCase().includes(q.toLowerCase())
    );
  }, [items, q]);

  const toggleOne = (id) => {
    const exists = safeSelected.includes(id);
    const next = exists
      ? safeSelected.filter((x) => x !== id)
      : [...safeSelected, id];

    setSelected(next); // ✅ IMPORTANT (no prev callback)
  };

  const selectAll = () => {
    setSelected(filtered.map((x) => x._id));
  };

  const clearAll = () => {
    setSelected([]);
  };

  return (
    <div
      className={`border rounded-lg p-4 ${
        error ? "border-red-500" : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">
            Selected: {safeSelected.length}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Clear
          </button>
        </div>
      </div>

      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
      />

      <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500">No results</p>
        ) : (
          filtered.map((it) => (
            <label
              key={it._id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={safeSelected.includes(it._id)}
                onChange={() => toggleOne(it._id)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-800">{it.name}</span>
            </label>
          ))
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};



const AdminOffer = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("adminToken");

  const [offers, setOffers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(true);

  const [form, setForm] = useState({
    title: "",
    type: "percent",
    value: "",
    appliesTo: "all",
    products: [],
    categories: [],
    festivals: [],
    startDate: "",
    endDate: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.value) newErrors.value = "Discount value is required";
    if (Number(form.value) <= 0) newErrors.value = "Value must be greater than 0";
    if (form.type === "percent" && Number(form.value) > 100)
      newErrors.value = "Percentage cannot exceed 100%";
    if (!form.startDate) newErrors.startDate = "Start date is required";
    if (!form.endDate) newErrors.endDate = "End date is required";
    if (
      form.startDate &&
      form.endDate &&
      new Date(form.startDate) > new Date(form.endDate)
    ) {
      newErrors.endDate = "End date must be after start date";
    }
    if (form.appliesTo === "category" && form.categories.length === 0) {
      newErrors.categories = "Select at least one category";
    }
    if (form.appliesTo === "festival" && form.festivals.length === 0) {
      newErrors.festivals = "Select at least one festival";
    }
    if (form.appliesTo === "selected" && form.products.length === 0) {
      newErrors.products = "Select at least one product";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/offers`);
      setOffers(res.data || []);
    } catch (err) {
      console.log("FETCH OFFERS ERROR:", err);
      alert("Failed to fetch offers");
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/menu/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("FETCH MENU ITEMS ERROR:", err);
      setMenuItems([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/categories`);
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("FETCH CATEGORIES ERROR:", err);
      setCategories([]);
    }
  };

  const fetchFestivals = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/festivals`);
      setFestivals(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("FETCH FESTIVALS ERROR:", err);
      setFestivals([]);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchMenuItems();
    fetchCategories();
    fetchFestivals();
  }, []);

  const selectorToShow = useMemo(() => {
    if (form.appliesTo === "selected") return "products";
    if (form.appliesTo === "category") return "categories";
    if (form.appliesTo === "festival") return "festivals";
    return null;
  }, [form.appliesTo]);

  const resetForm = () => {
    setForm({
      title: "",
      type: "percent",
      value: "",
      appliesTo: "all",
      products: [],
      categories: [],
      festivals: [],
      startDate: "",
      endDate: "",
      description: "",
    });
    setErrors({});
  };

  const createOffer = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        title: form.title,
        type: form.type,
        value: Number(form.value),
        appliesTo: form.appliesTo,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description,
      };

      if (form.appliesTo === "selected")
        payload.products = JSON.stringify(form.products);
      if (form.appliesTo === "category")
        payload.categories = JSON.stringify(form.categories);
      if (form.appliesTo === "festival")
        payload.festivals = JSON.stringify(form.festivals);

      const res = await axios.post(`${BACKEND_URL}/api/offers`, payload);

      if (res.data?.success) {
        alert("✅ Offer created successfully!");
        resetForm();
        fetchOffers();
        setActiveTab("list");
      } else {
        alert("❌ Failed to create offer");
      }
    } catch (err) {
      console.log("CREATE OFFER ERROR:", err);
      alert(err.response?.data?.message || "❌ Failed to create offer");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteOffer = async (id) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/offers/${id}`);
      fetchOffers();
    } catch (err) {
      alert(err.response?.data?.message || "❌ Failed to delete offer");
    }
  };

  const toggleOffer = async (id) => {
    try {
      await axios.patch(`${BACKEND_URL}/api/offers/toggle/${id}`);
      fetchOffers();
    } catch (err) {
      alert(err.response?.data?.message || "❌ Failed to toggle offer");
    }
  };

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchesSearch =
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description?.toLowerCase().includes(searchTerm.toLowerCase());

      if (statusFilter === "all") return matchesSearch;

      if (statusFilter === "active") {
        const now = new Date();
        const start = new Date(offer.startDate);
        const end = new Date(offer.endDate);
        return matchesSearch && now >= start && now <= end;
      }

      if (statusFilter === "upcoming") {
        const now = new Date();
        const start = new Date(offer.startDate);
        return matchesSearch && now < start;
      }

      if (statusFilter === "expired") {
        const now = new Date();
        const end = new Date(offer.endDate);
        return matchesSearch && now > end;
      }

      return matchesSearch;
    });
  }, [offers, searchTerm, statusFilter]);

  const getStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start)
      return { text: "Upcoming", color: "bg-blue-100 text-blue-800" };
    if (now > end)
      return { text: "Expired", color: "bg-gray-100 text-gray-800" };
    return { text: "Active", color: "bg-green-100 text-green-800" };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Offers Management
              </h1>
              <p className="text-gray-600 mt-1">
                Create and manage discount offers
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                {showForm ? "Hide Form" : "New Offer"}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mt-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-4 py-3 font-medium text-sm md:text-base whitespace-nowrap ${
                activeTab === "create"
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Create Offer
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-3 font-medium text-sm md:text-base whitespace-nowrap ${
                activeTab === "list"
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All Offers
              <span className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded-full">
                {offers.length}
              </span>
            </button>
          </div>
        </div>

        {/* Create Offer Form */}
        {activeTab === "create" && showForm && (
          <div className="bg-white rounded-xl shadow-sm border mb-6 md:mb-8 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="text-gray-600" size={20} />
                  <h2 className="text-lg font-semibold">Create New Offer</h2>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={createOffer} className="p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Offer Title *
                    </label>
                    <input
                      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent ${
                        errors.title ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., Christmas Special, Diwali Sale"
                      value={form.title}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, title: e.target.value }));
                        if (errors.title) setErrors((p) => ({ ...p, title: "" }));
                      }}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Optional description for this offer"
                      rows="3"
                      value={form.description}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, description: e.target.value }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Type *
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent"
                        value={form.type}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, type: e.target.value }))
                        }
                      >
                        <option value="percent">Percentage (%)</option>
                        <option value="flat">Flat Amount ($)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Value *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent ${
                            errors.value ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder={form.type === "percent" ? "0-100" : "0.00"}
                          step="0.01"
                          value={form.value}
                          onChange={(e) => {
                            setForm((p) => ({ ...p, value: e.target.value }));
                            if (errors.value)
                              setErrors((p) => ({ ...p, value: "" }));
                          }}
                        />
                        <div className="absolute right-3 top-3 text-gray-500">
                          {form.type === "percent" ? "%" : "$"}
                        </div>
                      </div>
                      {errors.value && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.value}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Applies To *
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent"
                      value={form.appliesTo}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          appliesTo: e.target.value,
                          products: [],
                          categories: [],
                          festivals: [],
                        }))
                      }
                    >
                      <option value="all">All Products</option>
                      <option value="selected">Selected Products</option>
                      <option value="category">Specific Categories</option>
                      <option value="festival">Festival Based</option>
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Validity Period *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar size={16} className="text-gray-500" />
                          <span className="text-sm">Start Date</span>
                        </div>
                        <input
                          type="date"
                          className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent ${
                            errors.startDate ? "border-red-500" : "border-gray-300"
                          }`}
                          value={form.startDate}
                          onChange={(e) => {
                            setForm((p) => ({ ...p, startDate: e.target.value }));
                            if (errors.startDate)
                              setErrors((p) => ({ ...p, startDate: "" }));
                          }}
                        />
                        {errors.startDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.startDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar size={16} className="text-gray-500" />
                          <span className="text-sm">End Date</span>
                        </div>
                        <input
                          type="date"
                          className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent ${
                            errors.endDate ? "border-red-500" : "border-gray-300"
                          }`}
                          value={form.endDate}
                          onChange={(e) => {
                            setForm((p) => ({ ...p, endDate: e.target.value }));
                            if (errors.endDate)
                              setErrors((p) => ({ ...p, endDate: "" }));
                          }}
                        />
                        {errors.endDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.endDate}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ✅ Dynamic Selector (Checkbox UI) */}
                  {selectorToShow && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Package size={16} className="text-gray-600" />
                        <label className="text-sm font-medium text-gray-700">
                          {selectorToShow === "products" && "Select Products"}
                          {selectorToShow === "categories" && "Select Categories"}
                          {selectorToShow === "festivals" && "Select Festivals"}
                          {selectorToShow && " *"}
                        </label>
                      </div>

                      {selectorToShow === "categories" && (
                        <CheckboxMultiSelect
                          title="Select Categories *"
                          items={categories}
                          selected={form.categories}
                          setSelected={(arr) => {
                            setForm((p) => ({ ...p, categories: arr }));
                            if (errors.categories)
                              setErrors((p) => ({ ...p, categories: "" }));
                          }}
                          placeholder="Search categories..."
                          error={errors.categories}
                        />
                      )}

                      {selectorToShow === "festivals" && (
                        <CheckboxMultiSelect
                          title="Select Festivals *"
                          items={festivals}
                          selected={form.festivals}
                          setSelected={(arr) => {
                            setForm((p) => ({ ...p, festivals: arr }));
                            if (errors.festivals)
                              setErrors((p) => ({ ...p, festivals: "" }));
                          }}
                          placeholder="Search festivals..."
                          error={errors.festivals}
                        />
                      )}

                      {selectorToShow === "products" && (
                        <CheckboxMultiSelect
                          title="Select Products *"
                          items={menuItems}
                          selected={form.products}
                          setSelected={(arr) => {
                            setForm((p) => ({ ...p, products: arr }));
                            if (errors.products)
                              setErrors((p) => ({ ...p, products: "" }));
                          }}
                          placeholder="Search products..."
                          error={errors.products}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Create Offer
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Offers List */}
        {activeTab === "list" && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">All Offers</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredOffers.length} offer(s) found
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search offers..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent w-full sm:w-auto"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Filter
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  </div>

                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
                </div>
              ) : filteredOffers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Tag className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No offers found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || statusFilter !== "all"
                      ? "Try changing your search criteria"
                      : "Create your first offer to get started"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredOffers.map((offer) => {
                    const status = getStatus(offer.startDate, offer.endDate);
                    return (
                      <div
                        key={offer._id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {offer.title}
                                </h3>
                                {offer.description && (
                                  <p className="text-gray-600 text-sm mt-1">
                                    {offer.description}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                              >
                                {status.text}
                              </span>
                            </div>

                            <div className="mt-4 space-y-2">
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Tag size={14} className="text-gray-500" />
                                  <span className="font-medium">
                                    {offer.type === "percent"
                                      ? `${offer.value}% off`
                                      : `$${offer.value} off`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Package size={14} className="text-gray-500" />
                                  <span className="text-gray-600">
                                    Applies to: {offer.appliesTo}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} className="text-gray-500" />
                                  <span className="text-gray-600">
                                    {formatDate(offer.startDate)} -{" "}
                                    {formatDate(offer.endDate)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleOffer(offer._id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Toggle Status"
                            >
                              {offer.active ? (
                                <ToggleRight className="text-green-600" size={20} />
                              ) : (
                                <ToggleLeft className="text-gray-400" size={20} />
                              )}
                            </button>
                            <button
                              onClick={() => deleteOffer(offer._id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="text-red-600" size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOffer;
