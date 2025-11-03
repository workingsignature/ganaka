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
  Skeleton,
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
import { debounce, times } from "lodash";
import { strategiesApi } from "@/store/api/strategies.api";
import type { v1_core_strategies_schemas } from "@ganaka/server-schemas";
import type { z } from "zod";

// Types
type StrategyResponse = z.infer<
  typeof v1_core_strategies_schemas.getStrategies.response
>;

// Helper function to compile tree data from strategies
const compileTreeData = (strategies: StrategyResponse["data"] | undefined) => {
  if (!strategies || strategies.length === 0) {
    return {
      root: {
        index: "root",
        isFolder: true,
        children: [],
        data: "Root",
      },
    };
  }

  const treeData: Record<string, TreeItem<string>> = {
    root: {
      index: "root",
      isFolder: true,
      children: strategies.map((s) => `strategy-${s.id}`),
      data: "Root",
    },
  };

  strategies.forEach((strategy) => {
    const strategyId = `strategy-${strategy.id}`;
    const versionChildren =
      strategy.versions?.map((v) => `version-${v.id}`) || [];

    treeData[strategyId] = {
      index: strategyId,
      isFolder: true,
      children: versionChildren,
      data: strategy.name,
    };

    strategy.versions?.forEach((version) => {
      const versionId = `version-${version.id}`;
      treeData[versionId] = {
        index: versionId,
        children: [],
        data: version.version,
      };
    });
  });

  console.log(treeData);
  return treeData;
};

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

  // API
  const {
    data: strategiesResponse,
    isFetching: isFetchingStrategies,
    isLoading: isLoadingStrategies,
  } = strategiesApi.useGetStrategiesQuery();

  // VARIABLES
  const dataProvider = useMemo(
    () =>
      strategiesResponse?.data
        ? new StaticTreeDataProvider(
            compileTreeData(strategiesResponse.data),
            (item, data) => ({
              ...item,
              data,
            })
          )
        : new StaticTreeDataProvider(
            {
              root: {
                index: "root",
                isFolder: true,
                children: [],
                data: "Root",
              },
            },
            (item, data) => ({
              ...item,
              data,
            })
          ),
    [strategiesResponse]
  );

  // Generate a stable key that changes whenever data changes
  const treeKey = useMemo(() => {
    if (!strategiesResponse?.data) return "empty";
    // Create a lightweight key from strategy and version IDs
    return strategiesResponse.data
      .map((s) => `${s.id}:${s.versions?.map((v) => v.id).join(",") || ""}`)
      .join("|");
  }, [strategiesResponse]);

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
      {isFetchingStrategies || isLoadingStrategies ? (
        <div className="h-full w-full flex flex-col gap-2">
          {times(10, (index) => (
            <Skeleton animate key={index} height={28} radius="sm" />
          ))}
        </div>
      ) : (
        <div className="h-full w-full">
          <UncontrolledTreeEnvironment
            key={treeKey}
            dataProvider={dataProvider}
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
      )}
    </Paper>
  );
};
