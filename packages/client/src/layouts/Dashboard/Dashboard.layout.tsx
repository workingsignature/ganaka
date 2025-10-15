import { DashboardPage } from "@/pages/Dashboard/Dashboard.page";
import { Navbar } from "./components/Navbar";

export const Dashboard = () => {
  // DRAW
  return (
    <div className="w-full h-full p-2 grid grid-rows-[55px_1fr] gap-2 overflow-hidden">
      <Navbar />
      <DashboardPage />
    </div>
  );
};
