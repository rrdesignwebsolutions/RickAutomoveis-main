import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import Estoque from "./pages/Estoque";
import VehiclePage from "./pages/VehiclePage";
import SobreNos from "./pages/SobreNos";
import Contato from "./pages/Contato";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminVehicleList from "./pages/Admin/AdminVehicleList";
import AdminVehicleForm from "./pages/Admin/AdminVehicleForm";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "estoque", Component: Estoque },
      { path: "veiculos/:slug", Component: VehiclePage },
      { path: "sobre", Component: SobreNos },
      { path: "contato", Component: Contato },
    ],
  },
  {
    path: "/admin",
    Component: AdminLogin,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { path: "dashboard", Component: AdminDashboard },
      { path: "veiculos", Component: AdminVehicleList },
      { path: "veiculos/:id", Component: AdminVehicleForm },
      { path: "veiculos/novo", Component: AdminVehicleForm },
    ],
  },
]);
