import React from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { FiPlus, FiList, FiCheckCircle, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";


const AdminLayout = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // 🔒 PROTECT ROUTE
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl border transition
     ${isActive ? "bg-black text-white" : "bg-white hover:bg-gray-100"}`;

  const handleLogout = () => {
    logout();               // clear auth
    navigate("/admin/login"); // redirect
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-50 p-4 border-r flex flex-col">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        {/* NAV LINKS */}
        <nav className="space-y-3 flex-1">
          <NavLink to="/admin/menu" className={linkClass}>
            <FiPlus /> Add Items
          </NavLink>

          <NavLink to="/admin/list" className={linkClass}>
            <FiList /> List Items
          </NavLink>

          <NavLink to="/admin/orders" className={linkClass}>
            <FiCheckCircle /> Orders
          </NavLink>

          <NavLink to="/admin/festivals/new" className={linkClass}>
            <FiCheckCircle /> Add Festival
          </NavLink>


          <NavLink to="/admin/festivals" className={linkClass}>
            <FiCheckCircle /> list Festivals
          </NavLink>

          <NavLink to="offers" className={linkClass}>
            <FiCheckCircle /> Offers
          </NavLink>
          
          <NavLink to="/admin/categories" className={linkClass}>
  📁 Categories
</NavLink>

<NavLink to="/admin/subcategories" className={linkClass}>
  🗂 Subcategories
</NavLink>



        </nav>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl border 
                     bg-red-50 text-red-600 hover:bg-red-100 transition"
        >
          <FiLogOut />
          Logout
        </button>
      </aside>

      {/* PAGE CONTENT */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
