import { icons } from "@/components/icons";
import { strategyFormSlice } from "@/store/forms/strategyFormSlice";
import { versionFormSlice } from "@/store/forms/versionFormSlice";
import { useAppDispatch } from "@/utils/hooks/storeHooks";
import { Icon } from "@iconify/react";
import {
  ActionIcon,
  Input,
  Menu,
  Paper,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useCallback, useMemo, useRef } from "react";
import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment,
  type TreeItem,
  type TreeItemIndex,
  type TreeItemRenderContext,
  type TreeRef,
} from "react-complex-tree";
import { debounce } from "lodash";

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
        onClick={() => {
          if (!item.isFolder) {
            console.log(item.data);
          }
        }}
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
  const treeRef = useRef<TreeRef>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // VARIABLES
  const dataProvider = useMemo(
    () =>
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
      ),
    []
  );

  // HANDLERS
  const handleCreateStrategy = () => {
    dispatch(strategyFormSlice.actions.setOpened(true));
  };
  const handleCreateVersion = () => {
    dispatch(versionFormSlice.actions.setOpened(true));
  };
  const findItemPath = useCallback(
    async (
      search: string,
      searchRoot: TreeItemIndex = "root"
    ): Promise<TreeItemIndex[] | null> => {
      const item = await dataProvider.getTreeItem(searchRoot);
      if (item.data.toLowerCase().includes(search.toLowerCase())) {
        return [item.index];
      }
      const searchedItems = await Promise.all(
        item.children?.map((child) => findItemPath(search, child)) ?? []
      );
      const result = searchedItems.find((item) => item !== null);
      if (!result) {
        return null;
      }
      return [item.index, ...result];
    },
    [dataProvider]
  );

  const handleSearchOnChange = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      if (event.target.value) {
        findItemPath(event.target.value).then((path) => {
          if (path) {
            // wait for full path including leaf, to make sure it loaded in
            treeRef.current?.expandSubsequently(path).then(() => {
              treeRef.current?.selectItems([path[path.length - 1]]);
              treeRef.current?.focusItem(path[path.length - 1]);
            });
          }
        });
      }
    },
    600
  );

  // DRAW
  return (
    <Paper
      withBorder
      p="md"
      className="h-full w-full !grid grid-rows-[32px_36px_1fr] gap-2 overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <Title className="block" order={4}>
          Strategies
        </Title>
        <div className="flex items-center justify-end">
          <Tooltip label="Sort Strategies">
            <ActionIcon
              variant="subtle"
              size="lg"
              color="dark"
              onClick={handleCreateStrategy}
            >
              <Icon icon={icons.sort} height={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Filter Strategies">
            <ActionIcon
              variant="subtle"
              size="lg"
              color="dark"
              className="mr-2"
              onClick={handleCreateStrategy}
            >
              <Icon icon={icons.filter} height={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Create Strategy">
            <ActionIcon
              variant="light"
              size="md"
              onClick={handleCreateStrategy}
            >
              <Icon icon={icons.create} />
            </ActionIcon>
          </Tooltip>
        </div>
      </div>
      <div className="w-full">
        <Input
          ref={searchInputRef}
          placeholder="Search Strategies"
          className="w-full"
          leftSection={<Icon icon={icons.search} />}
          onChange={handleSearchOnChange}
          onFocus={(e) => {
            e.target.select();
          }}
        />
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
          canSearchByStartingTyping={false}
          renderItem={renderItem({ handleCreateVersion })}
          renderSearchInput={() => null}
          canSearch={false}
        >
          <Tree
            treeId="tree-1"
            rootItem="root"
            treeLabel="Strategies"
            ref={treeRef}
          />
        </UncontrolledTreeEnvironment>
      </div>
    </Paper>
  );
};
