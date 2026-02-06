import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import AdminLayout from "./admin/AdminLayout";
import AdminMenu from "./admin/AdminMenu";
import AdminList from "./admin/AdminList";
import AdminOrders from "./admin/AdminOrders";
import EditMenu from "./admin/EditMenu";
import AdminLogin from "./admin/AdminLogin";
import AdminFestival from "./admin/AdminFestival";
import AdminFestivalList from "./admin/AdminFestivalList";
import AdminOffer from "./admin/AdminOffer";
import AdminCategory from "./admin/AdminCategory";
import AdminSubcategory from "./admin/AdminSubcategory";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminNewsletter from "./admin/AdminNewsletter";


function App() {
  const { token } = useAuth();

  return (
    <>
    <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    <Routes>
      {/* ✅ DEFAULT PAGE */}
      <Route
        path="/"
        element={
          token ? (
            <Navigate to="/admin/menu" replace />
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />

      {/* ✅ LOGIN PAGE (if already logged in -> send to dashboard) */}
      <Route
        path="/admin/login"
        element={token ? <Navigate to="/admin/menu" replace /> : <AdminLogin />}
      />

      {/* ✅ ADMIN ROUTES (protected) */}
      <Route
        path="/admin"
        element={token ? <AdminLayout /> : <Navigate to="/admin/login" replace />}
      >
        <Route index element={<Navigate to="menu" replace />} />

        <Route path="menu" element={<AdminMenu />} />
                <Route path="newsletter" element={<AdminNewsletter />} />
        <Route path="list" element={<AdminList />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="edit/:id" element={<EditMenu />} />

        <Route path="categories" element={<AdminCategory />} />
        <Route path="subcategories" element={<AdminSubcategory />} />

        <Route path="festivals" element={<AdminFestivalList />} />
        <Route path="festivals/new" element={<AdminFestival />} />

        <Route path="offers" element={<AdminOffer />} />
      </Route>

      {/* ✅ fallback */}
      <Route
        path="*"
        element={<Navigate to={token ? "/admin/menu" : "/admin/login"} replace />}
      />
    </Routes>
    </>
  );
}

export default App;
