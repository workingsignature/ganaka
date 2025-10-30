import { DataPane } from "./components/DataPane";
import { RunsPane } from "./components/RunsPane";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { StrategyVersionPane } from "./components/StrategyVersionPane";
import { useAuth } from "@clerk/clerk-react";

export const OverviewPage = () => {
  // HOOKS
  const { userId } = useAuth();

  // DRAW
  return (
    <div className="w-full h-full overflow-hidden">
      <PanelGroup autoSaveId={`dashboard-${userId}`} direction="horizontal">
        <Panel defaultSize={20} minSize={15} maxSize={30} className="pr-2">
          <StrategyVersionPane />
        </Panel>
        <PanelResizeHandle />
        <Panel defaultSize={20} minSize={20} maxSize={30} className="pr-2">
          <RunsPane />
        </Panel>
        <PanelResizeHandle />
        <Panel defaultSize={60} minSize={40} maxSize={80}>
          <DataPane />
        </Panel>
      </PanelGroup>
    </div>
  );
};
