import { icons } from "@/components/icons";
import { Icon } from "@iconify/react";
import {
  Breadcrumbs,
  Tooltip,
  Anchor,
  Popover,
  ActionIcon,
  Badge,
  Text,
  Paper,
  Tree,
  type TreeNodeData,
} from "@mantine/core";

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

export const CompaniesTab = () => {
  // VARIABLES
  const data: TreeNodeData[] = [
    {
      label: "src",
      value: "src",
      children: [
        {
          label: "components",
          value: "src/components",
          children: [
            { label: "Accordion.tsx", value: "src/components/Accordion.tsx" },
            { label: "Tree.tsx", value: "src/components/Tree.tsx" },
            { label: "Button.tsx", value: "src/components/Button.tsx" },
          ],
        },
      ],
    },
    {
      label: "node_modules",
      value: "node_modules",
      children: [
        {
          label: "react",
          value: "node_modules/react",
          children: [
            { label: "index.d.ts", value: "node_modules/react/index.d.ts" },
            { label: "package.json", value: "node_modules/react/package.json" },
          ],
        },
        {
          label: "@mantine",
          value: "node_modules/@mantine",
          children: [
            {
              label: "core",
              value: "node_modules/@mantine/core",
              children: [
                {
                  label: "index.d.ts",
                  value: "node_modules/@mantine/core/index.d.ts",
                },
                {
                  label: "package.json",
                  value: "node_modules/@mantine/core/package.json",
                },
              ],
            },
            {
              label: "hooks",
              value: "node_modules/@mantine/hooks",
              children: [
                {
                  label: "index.d.ts",
                  value: "node_modules/@mantine/hooks/index.d.ts",
                },
                {
                  label: "package.json",
                  value: "node_modules/@mantine/hooks/package.json",
                },
              ],
            },
            {
              label: "form",
              value: "node_modules/@mantine/form",
              children: [
                {
                  label: "index.d.ts",
                  value: "node_modules/@mantine/form/index.d.ts",
                },
                {
                  label: "package.json",
                  value: "node_modules/@mantine/form/package.json",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      label: "package.json",
      value: "package.json",
    },
    {
      label: "tsconfig.json",
      value: "tsconfig.json",
    },
  ];

  // DRAW
  return (
    <div className="h-full w-full grid grid-rows-[30px_1fr] mt-1 gap-1">
      <div className="w-full h-full grid grid-cols-[1fr_20px]">
        <div className="w-full h-full flex items-center">
          <Breadcrumbs separatorMargin="xs">
            <Tooltip label="All Companies">
              <Anchor truncate="end" maw={100} size="xs">
                All Companies
              </Anchor>
            </Tooltip>
          </Breadcrumbs>
        </div>
        <Popover width={200} position="bottom-start" shadow="md">
          <Popover.Target>
            <Tooltip label="Filter Companies">
              <ActionIcon
                className="mt-auto mb-auto"
                variant="subtle"
                size="sm"
              >
                <Icon icon={icons.filter} height={20} />
              </ActionIcon>
            </Tooltip>
          </Popover.Target>
          <Popover.Dropdown>
            <Tree data={data} />
          </Popover.Dropdown>
        </Popover>
      </div>
      <div className="flex flex-col gap-2">
        <CompanyCard name="Company 1" symbol="COMP1" exchange="NSE" />
        <CompanyCard name="Company 2" symbol="COMP2" exchange="BSE" />
        <CompanyCard name="Company 3" symbol="COMP3" exchange="NSE" />
      </div>
    </div>
  );
};
