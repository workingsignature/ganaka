import { Details } from "./components/Details";
import { Schedules } from "./components/Shedules";
import { Shortlists } from "./components/Shortlists";

export const DashboardPage = () => {
  // DRAW
  return (
    <div className="w-full h-full flex gap-3 overflow-hidden">
      <Schedules />
      <Shortlists />
      <Details />
    </div>
  );
};
