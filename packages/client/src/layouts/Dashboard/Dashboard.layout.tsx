import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { DashboardPage } from "@/pages/Dashboard/Dashboard.page";
import { useUser } from "@clerk/clerk-react";
import { format } from "date-fns";
import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";

export const Dashboard = () => {
  // HOOKS
  const { isSignedIn, isLoaded } = useUser();

  // VARIABLES
  const today = format(new Date(), "yyyy-MM-dd");

  // GUARDS
  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spinner variant="infinite" size={40} />
      </div>
    );
  }
  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }
  console.log({ window });

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
