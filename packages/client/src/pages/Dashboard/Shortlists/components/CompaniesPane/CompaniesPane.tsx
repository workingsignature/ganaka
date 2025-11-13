import { GPane } from "@/components/GPane";
import { CompaniesTab } from "./components/CompaniesTab";
import { SegmentedControl } from "@mantine/core";
import { useState } from "react";
import { ListsTab } from "./components/ListsTab";

export const CompaniesPane = () => {
  // STATE
  const [tab, setTab] = useState<"Companies" | "Lists">("Companies");

  // DRAW
  return (
    <GPane
      title={tab === "Companies" ? "Companies" : "Lists"}
      titleActions={
        <div className="h-full w-48">
          <SegmentedControl
            size="xs"
            fullWidth
            radius="xl"
            withItemsBorders={false}
            value={tab}
            onChange={(value) => setTab(value as typeof tab)}
            data={["Companies", "Lists"]}
          />
        </div>
      }
    >
      {tab === "Companies" ? <CompaniesTab /> : <ListsTab />}
    </GPane>
  );
};
