import { DashboardPage } from "@/pages/Dashboard/Dashboard.page";
import { Navbar } from "./components/Navbar";
import { Navigate, Route, Routes } from "react-router-dom";
import { format } from "date-fns";

export const Dashboard = () => {
  // VARIABLES
  // Get today's date in YYYY-MM-DD format
  const today = format(new Date(), "yyyy-MM-dd");

  // // EFFECTS
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     navigate("/auth");
  //   }
  // }, [isAuthenticated, navigate]);

  // DRAW
  return (
    <div className="w-full h-full p-2 grid grid-rows-[40px_1fr] gap-2">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to={`/${today}`} replace />} />
        <Route path="/:date" element={<DashboardPage />} />
      </Routes>
    </div>
  );
};
