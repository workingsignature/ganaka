import { useAppDispatch } from "@/utils/hooks/storeHooks";
import { Icon } from "@iconify/react";
import {
  ActionIcon,
  Button,
  Menu,
  Paper,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment,
  type TreeItem,
  type TreeItemRenderContext,
} from "react-complex-tree";
import { strategyFormSlice } from "@/store/forms/strategyFormSlice";
import { versionFormSlice } from "@/store/forms/versionFormSlice";
import { icons } from "@/components/icons";

// Custom render function for tree items
const renderItem =
  ({ handleCreateVersion }: { handleCreateVersion: () => void }) =>
  ({
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
    // const isActive = item.data?.includes("Active");
    // const isLatest = item.data?.includes("Latest");
    // const isVersion = !item.isFolder;
    const isActive = context.isSelected;

    // DRAW
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
          className={`cursor-pointer px-2 py-1 mb-1 rounded flex items-center gap-2 hover:bg-gray-50 ${
            context.isSelected
              ? "bg-gray-100 hover:bg-gray-100"
              : "bg-transparent"
          } ${context.itemContainerWithoutChildrenProps.className || ""}`}
        >
          {/* Icon */}
          {item.isFolder ? (
            <Icon
              icon={isActive ? icons.strategy_active : icons.strategy}
              className="w-[18px] h-[18px]"
            />
          ) : (
            <Icon icon={icons.version} className={`w-4 h-4`} />
          )}
          <div className="flex items-center justify-between w-full gap-2">
            <Text
              className="block max-w-40"
              size="sm"
              fw={item.isFolder ? 500 : 400}
              truncate="end"
            >
              {item.data?.replace(/ \(.*\)/, "") || item.data}
            </Text>

            {/* Badges for versions */}
            {/* {isVersion && (
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
        )} */}

            <div className="flex items-center justify-between gap-1">
              <Tooltip label="Create Version">
                <ActionIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateVersion();
                  }}
                  variant="subtle"
                  size="xs"
                  color="dark"
                  aria-label="Settings"
                >
                  <Icon
                    className="cursor-pointer"
                    icon={icons.create_version}
                  />
                </ActionIcon>
              </Tooltip>
              <Menu shadow="md" width={150} position="bottom-end">
                <Menu.Target>
                  <ActionIcon
                    onClick={(e) => e.stopPropagation()}
                    variant="subtle"
                    size="xs"
                    color="dark"
                    aria-label="Settings"
                  >
                    <Icon className="cursor-pointer" icon={icons.menu} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<Icon icon={icons.rename} />}>
                    Rename
                  </Menu.Item>
                  <Menu.Item
                    color="red"
                    leftSection={<Icon icon={icons.delete} />}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  };

export const StrategyVersionPane = () => {
  // HOOKS
  const dispatch = useAppDispatch();

  // HANDLERS
  const handleCreateStrategy = () => {
    dispatch(strategyFormSlice.actions.setOpened(true));
  };
  const handleCreateVersion = () => {
    dispatch(versionFormSlice.actions.setOpened(true));
  };

  // DRAW
  return (
    <Paper
      withBorder
      p="md"
      className="h-full w-full !grid grid-rows-[32px_1fr] gap-2 overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <Title className="block" order={4}>
          Strategies
        </Title>
        <Button
          variant="light"
          size="xs"
          leftSection={<Icon icon={icons.create} />}
          onClick={handleCreateStrategy}
        >
          Create Strategy
        </Button>
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
          renderItem={renderItem({ handleCreateVersion })}
        >
          <Tree treeId="tree-1" rootItem="root" treeLabel="Strategies" />
        </UncontrolledTreeEnvironment>
      </div>
    </Paper>
  );
};
