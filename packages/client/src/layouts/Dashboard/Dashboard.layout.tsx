import { OverviewPage } from "@/pages/Dashboard/Overview.page";
import { SideNav } from "./components/SideNav";
import { Navigate, Route, Routes } from "react-router-dom";
import { NotFound } from "../NotFound/NotFound";
import { ShortlistsPage } from "@/pages/Dashboard/Shortlists.page";

export const Dashboard = () => {
  // DRAW
  return (
    <div className="w-full h-full p-2 grid grid-cols-[40px_1fr] gap-2 overflow-hidden">
      <SideNav />
      <Routes>
        <Route path="overview" element={<OverviewPage />} />
        <Route path="shortlists" element={<ShortlistsPage />} />
        <Route path="/" element={<Navigate to="overview" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};
