import React, { useState } from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiList,
  FiCheckCircle,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔒 PROTECT ROUTE
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl border transition text-sm
     ${
       isActive
         ? "bg-black text-white border-black"
         : "bg-white hover:bg-gray-100 border-gray-200"
     }`;

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* ✅ MOBILE TOP BAR */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg border bg-gray-50 hover:bg-gray-100"
        >
          <FiMenu className="text-lg" />
        </button>

        <h2 className="font-bold text-base">Admin Panel</h2>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg border bg-red-50 text-red-600 hover:bg-red-100"
        >
          <FiLogOut className="text-lg" />
        </button>
      </div>

      {/* ✅ OVERLAY (Mobile) */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* ✅ SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-gray-50 border-r p-4 flex flex-col
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:w-64
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Admin Panel</h2>

          {/* Close button only mobile */}
          <button
            onClick={closeSidebar}
            className="md:hidden p-2 rounded-lg border bg-white hover:bg-gray-100"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* NAV LINKS */}
        <nav className="space-y-3 flex-1 overflow-y-auto">
          <NavLink to="/admin/menu" className={linkClass} onClick={closeSidebar}>
            <FiPlus /> Add Items
          </NavLink>

          <NavLink to="/admin/list" className={linkClass} onClick={closeSidebar}>
            <FiList /> List Items
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={linkClass}
            onClick={closeSidebar}
          >
            <FiCheckCircle /> Orders
          </NavLink>

          <NavLink
            to="/admin/festivals/new"
            className={linkClass}
            onClick={closeSidebar}
          >
            <FiCheckCircle /> Add Festival
          </NavLink>

          <NavLink
            to="/admin/festivals"
            className={linkClass}
            onClick={closeSidebar}
          >
            <FiCheckCircle /> List Festivals
          </NavLink>

          <NavLink to="/admin/offers" className={linkClass} onClick={closeSidebar}>
            <FiCheckCircle /> Offers
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={linkClass}
            onClick={closeSidebar}
          >
            📁 Categories
          </NavLink>

          <NavLink
            to="/admin/subcategories"
            className={linkClass}
            onClick={closeSidebar}
          >
            🗂 Subcategories
          </NavLink>
        </nav>

        {/* LOGOUT BUTTON (Desktop sidebar) */}
        <button
          onClick={handleLogout}
          className="mt-6 hidden md:flex items-center gap-3 px-4 py-3 rounded-xl border 
                     bg-red-50 text-red-600 hover:bg-red-100 transition"
        >
          <FiLogOut />
          Logout
        </button>
      </aside>

      {/* PAGE CONTENT */}
      <main className="flex-1 p-4 sm:p-6 w-full">
        {/* add padding top for mobile navbar */}
        <div className="md:hidden h-14" />
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
