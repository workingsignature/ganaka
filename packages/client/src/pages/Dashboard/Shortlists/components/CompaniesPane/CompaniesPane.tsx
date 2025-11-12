import { GPane } from "@/components/GPane";
import { Tabs } from "@mantine/core";
import { CompaniesTab } from "./components/CompaniesTab";
import { ListsTab } from "./components/ListsTab";

export const CompaniesPane = () => {
  // HOOKS

  // DRAW
  return (
    <GPane title="Companies">
      <Tabs
        variant="pills"
        defaultValue="companies"
        className="h-full overflow-hidden"
      >
        <Tabs.List className="shrink-0">
          <Tabs.Tab value="companies">Companies</Tabs.Tab>
          <Tabs.Tab value="lists">Lists</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel className="h-full overflow-hidden" value="companies">
          <CompaniesTab />
        </Tabs.Panel>
        <Tabs.Panel className="flex-1 overflow-hidden" value="lists">
          <ListsTab />
        </Tabs.Panel>
      </Tabs>
    </GPane>
  );
};
