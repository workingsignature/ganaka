import { GPane } from "@/components/GPane";
import { Tabs } from "@mantine/core";
import { CompaniesTab } from "./components/CompaniesTab";
import { ListsTab } from "./components/ListsTab";

export const CompaniesPane = () => {
  // HOOKS

  // DRAW
  return (
    <GPane title="Companies">
      <Tabs variant="pills" defaultValue="companies">
        <Tabs.List>
          <Tabs.Tab value="companies">Companies</Tabs.Tab>
          <Tabs.Tab value="lists">Lists</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="companies">
          <CompaniesTab />
        </Tabs.Panel>
        <Tabs.Panel value="lists">
          <ListsTab />
        </Tabs.Panel>
      </Tabs>
    </GPane>
  );
};
