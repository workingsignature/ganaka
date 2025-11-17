import { GPane } from "@/components/GPane";
import { icons } from "@/components/icons";
import { strategiesAPI } from "@/store/api/strategies.api";
import { versionsAPI } from "@/store/api/versions.api";
import { strategyFormSlice } from "@/store/forms/strategyFormSlice";
import { versionFormSlice } from "@/store/forms/versionFormSlice";
import { runFormSlice } from "@/store/forms/runFormSlice";
import { useAppDispatch } from "@/utils/hooks/storeHooks";
import type { v1_core_strategies_schemas } from "@ganaka/server-schemas";
import { Icon } from "@iconify/react";
import { ActionIcon, Menu, Skeleton, Text, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { debounce, times } from "lodash";
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
      strategy.versions?.map(
        (v) => `strategy-${strategy.id}|version-${v.id}`
      ) || [];

    treeData[strategyId] = {
      index: strategyId,
      isFolder: true,
      children: versionChildren,
      data: strategy.name,
    };

    strategy.versions?.forEach((version) => {
      const versionId = `strategy-${strategy.id}|version-${version.id}`;
      treeData[versionId] = {
        index: versionId,
        children: [],
        data: version.version,
      };
    });
  });

  return treeData;
};

// Custom render function for tree items
const renderItem =
  ({
    handleCreateVersion,
    handleEditStrategy,
    handleDeleteStrategy,
    handleEditVersion,
    handleDeleteVersion,
    handleSelectVersion,
  }: {
    handleCreateVersion: (strategyId: string) => void;
    handleEditStrategy: (strategyId: string) => void;
    handleDeleteStrategy: (data: {
      strategyId: string;
      strategyName: string;
    }) => void;
    handleEditVersion: ({
      versionId,
      strategyId,
    }: {
      versionId: string;
      strategyId: string;
    }) => void;
    handleDeleteVersion: (data: {
      strategyId: string;
      versionId: string;
      versionName: string;
    }) => void;
    handleSelectVersion: ({
      versionId,
      strategyId,
    }: {
      versionId: string;
      strategyId: string;
    }) => void;
  }) =>
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
    // VARIABLES
    const isActive = context.isSelected;
    const strategyId = item.index
      .toString()
      .split("|")[0]
      .replace("strategy-", "");
    const versionId = !item.isFolder
      ? item.index.toString().split("|")[1]?.replace("version-", "")
      : null;

    // HANDLERS
    const handleEdit = () => {
      if (item.isFolder) {
        handleEditStrategy(strategyId);
      } else if (versionId) {
        handleEditVersion({ versionId: versionId, strategyId });
      }
    };
    const handleDelete = () => {
      if (item.isFolder) {
        handleDeleteStrategy({ strategyId, strategyName: item.data });
      } else if (versionId) {
        handleDeleteVersion({
          strategyId,
          versionId,
          versionName: item.data,
        });
      }
    };

    // DRAW
    return (
      <div
        {...context.itemContainerWithChildrenProps}
        className={context.itemContainerWithChildrenProps.className}
        onClick={() => {
          if (!item.isFolder && versionId) {
            // Set the selected version in runFormSlice when a version is clicked
            handleSelectVersion({ versionId, strategyId });
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
            <div className="flex items-center justify-between gap-1">
              {item.isFolder ? (
                <Tooltip label="Create Version">
                  <ActionIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateVersion(strategyId);
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
              ) : null}
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
                  {item.isFolder ? (
                    <Menu.Item
                      leftSection={<Icon icon={icons.edit} />}
                      onClick={() => handleEdit()}
                    >
                      Edit Strategy
                    </Menu.Item>
                  ) : (
                    <Menu.Item
                      leftSection={<Icon icon={icons.edit} />}
                      onClick={() => handleEdit()}
                    >
                      Edit Version
                    </Menu.Item>
                  )}
                  <Menu.Item
                    color="red"
                    leftSection={<Icon icon={icons.delete} />}
                    onClick={() => handleDelete()}
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

  // API
  const getAllStrategiesAPI = strategiesAPI.useGetStrategiesQuery();
  const [deleteStrategy, deleteStrategyAPI] =
    strategiesAPI.useDeleteStrategyMutation();
  const [deleteVersion, deleteVersionAPI] =
    versionsAPI.useDeleteVersionMutation();

  // VARIABLES
  const dataProvider = useMemo(
    () =>
      getAllStrategiesAPI.data?.data
        ? new StaticTreeDataProvider(
            compileTreeData(getAllStrategiesAPI.data.data),
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
    [getAllStrategiesAPI.data]
  );

  // Generate a stable key that changes whenever data changes
  const treeKey = useMemo(() => {
    if (!getAllStrategiesAPI.data?.data) return "empty";
    // Create a lightweight key from strategy and version IDs
    return getAllStrategiesAPI.data.data
      .map((s) => `${s.id}:${s.versions?.map((v) => v.id).join(",") || ""}`)
      .join("|");
  }, [getAllStrategiesAPI.data]);

  // HANDLERS
  const handleCreateStrategy = () => {
    dispatch(strategyFormSlice.actions.setOpened(true));
  };
  const handleRefreshStrategies = () => {
    getAllStrategiesAPI.refetch();
  };
  const handleCreateVersion = (strategyId: string) => {
    dispatch(versionFormSlice.actions.setStrategyId(strategyId));
    dispatch(versionFormSlice.actions.setVersionId(""));
    dispatch(versionFormSlice.actions.setIsCreateMode(true));
    dispatch(versionFormSlice.actions.setOpened(true));
  };
  const handleEditVersion = ({
    versionId,
    strategyId,
  }: {
    versionId: string;
    strategyId: string;
  }) => {
    dispatch(versionFormSlice.actions.setVersionId(versionId));
    dispatch(versionFormSlice.actions.setStrategyId(strategyId));
    dispatch(versionFormSlice.actions.setIsCreateMode(false));
    dispatch(versionFormSlice.actions.setOpened(true));
  };
  const handleDeleteVersion = ({
    strategyId,
    versionId,
    versionName,
  }: {
    strategyId: string;
    versionId: string;
    versionName: string;
  }) => {
    modals.openConfirmModal({
      title: `Delete Version "${versionName}"`,
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete this version? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: "Delete Version", cancel: "No, don't delete it" },
      confirmProps: { color: "red", loading: deleteVersionAPI.isLoading },
      onConfirm: async () => {
        const response = await deleteVersion({
          strategyid: strategyId,
          id: versionId,
        });
        if (response.data) {
          notifications.show({
            title: "Success",
            message: response.data.message,
            color: "green",
          });
        }
      },
    });
  };
  const handleSelectVersion = ({
    versionId,
    strategyId,
  }: {
    versionId: string;
    strategyId: string;
  }) => {
    dispatch(runFormSlice.actions.setStrategyId(strategyId));
    dispatch(runFormSlice.actions.setVersionId(versionId));
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
  const handleEditStrategy = (strategyId: string) => {
    dispatch(strategyFormSlice.actions.setIsCreateMode(false));
    dispatch(strategyFormSlice.actions.setStrategyId(strategyId));
    dispatch(strategyFormSlice.actions.setOpened(true));
  };
  const handleDeleteStrategy = ({
    strategyId,
    strategyName,
  }: {
    strategyId: string;
    strategyName: string;
  }) => {
    modals.openConfirmModal({
      title: `Delete Strategy "${strategyName}"`,
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete this strategy? This will also delete
          all versions associated with this strategy.
        </Text>
      ),
      labels: { confirm: "Delete Strategy", cancel: "No, don't delete it" },
      confirmProps: { color: "red", loading: deleteStrategyAPI.isLoading },
      onConfirm: async () => {
        const response = await deleteStrategy({ id: strategyId });
        if (response.data) {
          notifications.show({
            title: "Success",
            message: response.data.message,
            color: "green",
          });
        }
      },
    });
  };

  // DRAW
  return (
    <GPane
      title="Strategies"
      onSearchChange={handleSearchOnChange}
      searchPlaceholder="Search Strategies"
      titleActions={
        <div className="flex items-center justify-end">
          <Tooltip label="Refresh Strategies">
            <ActionIcon
              variant="subtle"
              size="lg"
              color="dark"
              onClick={handleRefreshStrategies}
            >
              <Icon icon={icons.refresh} height={20} />
            </ActionIcon>
          </Tooltip>
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
      }
    >
      {getAllStrategiesAPI.isLoading ? (
        <div className="h-full w-full flex flex-col gap-2">
          {times(10, (index) => (
            <Skeleton animate key={index} height={28} radius="sm" />
          ))}
        </div>
      ) : getAllStrategiesAPI.data &&
        getAllStrategiesAPI.data.data.length > 0 ? (
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
            renderItem={renderItem({
              handleCreateVersion,
              handleEditStrategy,
              handleDeleteStrategy,
              handleEditVersion,
              handleDeleteVersion,
              handleSelectVersion,
            })}
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
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center gap-5">
          <Icon icon={icons.empty} height={60} />
          <Text size="md" c="dimmed" ta="center">
            No strategies found.
            <br />
            Create a new strategy to get started.
          </Text>
        </div>
      )}
    </GPane>
  );
};
