import { Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ADMIN */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="menu" element={<AdminMenu />} />
        <Route path="list" element={<AdminList />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="edit/:id" element={<EditMenu />} />

        {/* CATEGORY */}
        <Route path="categories" element={<AdminCategory />} />
        <Route path="subcategories" element={<AdminSubcategory />} />

        {/* FESTIVALS */}
        <Route path="festivals" element={<AdminFestivalList />} />
        <Route path="festivals/new" element={<AdminFestival />} />

        {/* OFFERS */}
        <Route path="offers" element={<AdminOffer />} />
      </Route>
    </Routes>
  );
}

export default App;
