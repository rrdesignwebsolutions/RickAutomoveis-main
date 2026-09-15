import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Root() {
  const location = useLocation();
  const noFooter = location.pathname.startsWith("/admin");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#ffffff" }}>
      <Header />
      <Outlet />
      {!noFooter && <Footer />}
    </div>
  );
}
