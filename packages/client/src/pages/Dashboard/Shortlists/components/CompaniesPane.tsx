import { GPane } from "@/components/GPane";
import { Badge, Paper, Tabs, Text } from "@mantine/core";

const CompanyCard = ({
  exchange,
  name,
  symbol,
}: {
  name: string;
  symbol: string;
  exchange: string;
}) => {
  return (
    <Paper
      withBorder
      p="sm"
      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Text fw={500} size="sm" className="truncate">
            {name}
          </Text>
          <Text size="xs" c="dimmed" className="mt-1">
            {symbol}
          </Text>
        </div>
        <Badge size="xs" variant="light" color="blue">
          {exchange}
        </Badge>
      </div>
    </Paper>
  );
};

export const CompaniesPane = () => {
  // HOOKS

  // DRAW
  return (
    <GPane title="Shortlists">
      <Tabs variant="pills" defaultValue="companies">
        <Tabs.List>
          <Tabs.Tab value="companies">Companies</Tabs.Tab>
          <Tabs.Tab value="lists">Lists</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="companies">
          <div className="flex flex-col gap-2 mt-3">
            <CompanyCard name="Company 1" symbol="COMP1" exchange="NSE" />
            <CompanyCard name="Company 2" symbol="COMP2" exchange="BSE" />
            <CompanyCard name="Company 3" symbol="COMP3" exchange="NSE" />
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="lists">Lists tab content</Tabs.Panel>
      </Tabs>
    </GPane>
  );
};
