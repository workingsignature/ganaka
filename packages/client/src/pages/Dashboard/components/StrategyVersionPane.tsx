import { Paper, Title, Badge, Group, Text } from "@mantine/core";
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
  type TreeItemRenderContext,
  type TreeItem,
} from "react-complex-tree";
import { Icon } from "@iconify/react";

export const StrategyVersionPane = () => {
  // Custom render function for tree items
  const renderItem = ({
    item,
    depth,
    children,
    context,
  }: {
    item: TreeItem<string>;
    depth: number;
    children: React.ReactNode;
    title: React.ReactNode;
    arrow: React.ReactNode;
    context: TreeItemRenderContext;
  }) => {
    const isActive = item.data?.includes("Active");
    const isLatest = item.data?.includes("Latest");
    const isVersion = !item.isFolder;

    return (
      <div
        {...context.itemContainerWithChildrenProps}
        className={context.itemContainerWithChildrenProps.className}
        style={{
          ...context.itemContainerWithChildrenProps.style,
          paddingLeft: `${depth * 24}px`,
        }}
      >
        <div
          {...context.itemContainerWithoutChildrenProps}
          {...context.interactiveElementProps}
          className={`cursor-pointer px-1 py-1 rounded flex items-center gap-2 hover:bg-gray-50 ${
            context.isSelected
              ? "bg-gray-100 hover:bg-gray-100"
              : "bg-transparent"
          } ${context.itemContainerWithoutChildrenProps.className || ""}`}
        >
          {/* Icon */}
          {item.isFolder ? (
            <Icon
              icon="fluent:brain-48-regular"
              className="w-[18px] h-[18px]"
            />
          ) : (
            <Icon
              icon="qlementine-icons:version-control-16"
              className={`w-4 h-4`}
            />
          )}

          {/* Title */}
          <Text size="sm" fw={item.isFolder ? 500 : 400}>
            {item.data?.replace(/ \(.*\)/, "") || item.data}
          </Text>

          {/* Badges for versions */}
          {isVersion && (
            <Group gap="xs" className="ml-auto">
              {isActive && (
                <Badge size="xs" variant="filled" color="green">
                  Active
                </Badge>
              )}
              {isLatest && (
                <Badge size="xs" variant="light" color="blue">
                  Latest
                </Badge>
              )}
            </Group>
          )}
        </div>
        {children}
      </div>
    );
  };

  // DRAW
  return (
    <Paper
      withBorder
      p="md"
      className="h-full w-full !grid grid-rows-[20px_1fr] gap-2"
    >
      <div className="flex items-center justify-between">
        <Title order={4}>Strategies</Title>
      </div>
      <div>
        <UncontrolledTreeEnvironment
          dataProvider={
            new StaticTreeDataProvider(
              {
                root: {
                  index: "root",
                  isFolder: true,
                  children: ["strategy-1", "strategy-2", "strategy-3"],
                  data: "Root",
                },
                "strategy-1": {
                  index: "strategy-1",
                  isFolder: true,
                  children: ["strategy-1-v1", "strategy-1-v2", "strategy-1-v3"],
                  data: "Mean Reversion Strategy",
                },
                "strategy-1-v1": {
                  index: "strategy-1-v1",
                  children: [],
                  data: "v1.0.0 (Active)",
                },
                "strategy-1-v2": {
                  index: "strategy-1-v2",
                  children: [],
                  data: "v1.1.0",
                },
                "strategy-1-v3": {
                  index: "strategy-1-v3",
                  children: [],
                  data: "v2.0.0 (Latest)",
                },
                "strategy-2": {
                  index: "strategy-2",
                  isFolder: true,
                  children: ["strategy-2-v1", "strategy-2-v2"],
                  data: "Momentum Breakout",
                },
                "strategy-2-v1": {
                  index: "strategy-2-v1",
                  children: [],
                  data: "v1.0.0",
                },
                "strategy-2-v2": {
                  index: "strategy-2-v2",
                  children: [],
                  data: "v1.5.0 (Active)",
                },
                "strategy-3": {
                  index: "strategy-3",
                  isFolder: true,
                  children: ["strategy-3-v1"],
                  data: "Options Straddle",
                },
                "strategy-3-v1": {
                  index: "strategy-3-v1",
                  children: [],
                  data: "v1.0.0 (Active)",
                },
              },
              (item, data) => ({
                ...item,
                data,
              })
            )
          }
          getItemTitle={(item) => item.data}
          viewState={{
            "tree-1": {
              expandedItems: ["root"],
            },
          }}
          renderItem={renderItem}
        >
          <Tree treeId="tree-1" rootItem="root" treeLabel="Strategies" />
        </UncontrolledTreeEnvironment>
      </div>
    </Paper>
  );
};
