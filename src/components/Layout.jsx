
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CustomerSessionMonitor from "./CustomerSessionMonitor";

function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3EEE5]">

      <CustomerSessionMonitor />

      <Navbar />

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>

      <Footer />

    </div>
  );
}

export default Layout;
