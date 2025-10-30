import { DataPane } from "./components/DataPane";
import { RunsPane } from "./components/RunsPane";
import { StrategyVersionPane } from "./components/StrategyVersionPane";

export const OverviewPage = () => {
  // DRAW
  return (
    <div className="w-full h-full overflow-hidden grid grid-cols-[350px_400px_1fr] gap-2">
      <StrategyVersionPane />
      <RunsPane />
      <DataPane />
    </div>
  );
};
