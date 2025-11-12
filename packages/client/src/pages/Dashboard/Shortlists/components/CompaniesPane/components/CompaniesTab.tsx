import { icons } from "@/components/icons";
import {
  useGetInstrumentsFilterTreeQuery,
  useGetInstrumentsQuery,
} from "@/store/api/instruments.api";
import { Icon } from "@iconify/react";
import {
  ActionIcon,
  Avatar,
  Center,
  Checkbox,
  Loader,
  Paper,
  Popover,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Tooltip,
  Tree,
  type TreeNodeData,
} from "@mantine/core";
import { times } from "lodash";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";

const CompanyCard = ({
  name,
  symbol,
}: {
  name: string;
  symbol: string;
  exchange: string;
}) => {
  // DRAW
  return (
    <Paper
      p="sm"
      withBorder
      shadow="xs"
      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
    >
      <div className="w-full h-full grid grid-cols-[20px_auto] gap-5 px-2">
        <div className="w-full h-full flex items-center justify-center">
          <Avatar
            src={`https://images.dhan.co/symbol/${symbol}.png`}
            size="md"
            name={name}
            color="initials"
            className="object-contain"
          />
        </div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Text fw={500} size="sm" className="truncate">
              {name}
            </Text>
            <Text size="xs" c="dimmed" className="mt-1">
              {symbol}
            </Text>
          </div>
        </div>
      </div>
    </Paper>
  );
};

const FilterTree = ({
  selectedCategories,
  filterTreeNodes,
  isLoading,
  setSelectedCategories,
}: {
  selectedCategories: string[];
  setSelectedCategories: Dispatch<SetStateAction<string[]>>;
  filterTreeNodes: TreeNodeData[];
  isLoading: boolean;
}) => {
  // VARIABLES
  const treeIndentationInPx = 10;

  // Build a map of node values to their parent and all nodes for quick lookup
  const nodeMap = useMemo(() => {
    const map = new Map<
      string,
      { node: TreeNodeData; parent: TreeNodeData | null }
    >();

    const buildMap = (
      nodes: TreeNodeData[],
      parent: TreeNodeData | null = null
    ) => {
      for (const node of nodes) {
        map.set(String(node.value), { node, parent });
        if (node.children && node.children.length > 0) {
          buildMap(node.children, node);
        }
      }
    };

    buildMap(filterTreeNodes);
    return map;
  }, [filterTreeNodes]);

  // HELPERS
  const getAllDescendantValues = (node: TreeNodeData): string[] => {
    const values: string[] = [];

    const collectValues = (children: TreeNodeData[]) => {
      for (const child of children) {
        values.push(String(child.value));
        if (child.children && child.children.length > 0) {
          collectValues(child.children);
        }
      }
    };

    if (node.children && node.children.length > 0) {
      collectValues(node.children);
    }

    return values;
  };

  const areAllChildrenSelected = (
    node: TreeNodeData,
    categories: string[]
  ): boolean => {
    if (!node.children || node.children.length === 0) {
      return false;
    }

    return node.children.every((child) =>
      categories.includes(String(child.value))
    );
  };

  const updateParentSelections = (categories: string[]): string[] => {
    const result = new Set(categories);

    // Get all unique parent nodes
    const parentNodes = new Set<TreeNodeData>();
    for (const [, { parent }] of nodeMap.entries()) {
      if (parent) {
        parentNodes.add(parent);
      }
    }

    // Update each parent's selection based on its children
    // Parent should ONLY be selected if ALL children are selected
    for (const parent of parentNodes) {
      const parentValue = String(parent.value);
      const allChildrenSelected = areAllChildrenSelected(
        parent,
        Array.from(result)
      );

      if (allChildrenSelected) {
        // All children are selected, so select the parent
        result.add(parentValue);
      } else {
        // Not all children are selected, so remove parent from selection
        // (it will show as indeterminate if some children are selected)
        result.delete(parentValue);
      }
    }

    return Array.from(result);
  };

  const isNodeIndeterminate = (node: TreeNodeData): boolean => {
    // If node has no children, it can't be indeterminate
    if (!node.children || node.children.length === 0) {
      return false;
    }

    // Check how many children (direct and indirect) are selected
    const checkSelectionStatus = (
      children: TreeNodeData[]
    ): { hasSelected: boolean; hasUnselected: boolean } => {
      let hasSelected = false;
      let hasUnselected = false;

      for (const child of children) {
        const isSelected = selectedCategories.includes(String(child.value));

        if (child.children && child.children.length > 0) {
          const childStatus = checkSelectionStatus(child.children);
          hasSelected = hasSelected || isSelected || childStatus.hasSelected;
          hasUnselected =
            hasUnselected || !isSelected || childStatus.hasUnselected;
        } else {
          hasSelected = hasSelected || isSelected;
          hasUnselected = hasUnselected || !isSelected;
        }

        if (hasSelected && hasUnselected) {
          break; // Early exit if we already found both states
        }
      }

      return { hasSelected, hasUnselected };
    };

    const status = checkSelectionStatus(node.children);
    // Indeterminate if some but not all descendants are selected
    return status.hasSelected && status.hasUnselected;
  };

  // DRAW
  return (
    <div className="overflow-y-auto" style={{ maxHeight: "380px" }}>
      {isLoading ? (
        <div className="flex justify-center flex-col items-center gap-2">
          {times(10, (index) => (
            <div key={index} className="w-full flex items-center gap-1">
              <Skeleton circle height={18} />
              <Icon icon={icons.chevronRight} height={14} />
              <Skeleton height={18} radius="xl" />
            </div>
          ))}
        </div>
      ) : (
        <Tree
          data={filterTreeNodes}
          levelOffset={20}
          renderNode={({
            node,
            expanded,
            hasChildren,
            elementProps,
            level,
          }) => {
            // VARIABLES
            // The level is 1-based, so we need to normalize it to 0-based
            const normalizedLevel = level - 1;

            // DRAW
            return (
              <div
                {...elementProps}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1"
                style={{
                  paddingLeft: `${normalizedLevel * treeIndentationInPx}px`,
                }}
              >
                <Checkbox
                  checked={selectedCategories.includes(String(node.value))}
                  indeterminate={isNodeIndeterminate(node)}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onChange={(event) => {
                    event.stopPropagation();
                    const nodeValue = String(node.value);
                    const isCurrentlySelected =
                      selectedCategories.includes(nodeValue);

                    setSelectedCategories((prev) => {
                      let newCategories: string[];

                      if (isCurrentlySelected) {
                        // Deselect: Remove this node and all its descendants
                        const descendantValues = getAllDescendantValues(node);
                        newCategories = prev.filter(
                          (category) =>
                            category !== nodeValue &&
                            !descendantValues.includes(category)
                        );
                      } else {
                        // Select: Add this node and all its descendants
                        const descendantValues = getAllDescendantValues(node);
                        const allValues = [nodeValue, ...descendantValues];
                        // Use Set to avoid duplicates
                        newCategories = [...new Set([...prev, ...allValues])];
                      }

                      // Update parent selections based on children states
                      return updateParentSelections(newCategories);
                    });
                  }}
                  size="xs"
                  radius="xl"
                  classNames={{
                    input: "!cursor-pointer",
                  }}
                />
                {hasChildren && (
                  <Icon
                    icon={expanded ? icons.chevronDown : icons.chevronRight}
                    height={14}
                  />
                )}
                <Text size="sm">{node.label}</Text>
              </div>
            );
          }}
        />
      )}
    </div>
  );
};

export const CompaniesTab = () => {
  // STATE
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // API
  // API
  const getFilterTreeAPI = useGetInstrumentsFilterTreeQuery();
  const getInstrumentsAPI = useGetInstrumentsQuery({
    categories:
      selectedCategories.length > 0 ? selectedCategories.join(",") : undefined,
    pageno: 1,
    pagesize: 50,
  });

  // VARIABLES
  const filterTreeNodes = useMemo(() => {
    return getFilterTreeAPI.data?.data?.tree || [];
  }, [getFilterTreeAPI.data]);

  // HANDLERS
  const handleClearFilters = () => {
    setSelectedCategories([]);
  };

  // DRAW
  return (
    <div className="h-full w-full grid grid-rows-[40px_1fr] mt-2 gap-2 overflow-hidden">
      <div className="w-full h-full grid grid-cols-[1fr_auto] gap-1">
        <div className="w-full h-full flex items-center justify-start">
          <TextInput
            placeholder="Search companies..."
            leftSection={<Icon icon={icons.search} />}
            className="w-full"
            radius="xl"
            classNames={{
              wrapper: "!mb-0",
            }}
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          {selectedCategories.length > 0 && (
            <Tooltip label="Clear Filters">
              <ActionIcon
                className="mt-auto mb-auto"
                variant="subtle"
                size="sm"
                color="red"
                onClick={handleClearFilters}
              >
                <Icon icon={icons.close} height={16} />
              </ActionIcon>
            </Tooltip>
          )}
          <Popover width={350} position="right-start">
            <Popover.Target>
              <Tooltip label="Filter by Sector/Industry">
                <ActionIcon
                  className="mt-auto mb-auto"
                  variant="light"
                  size="lg"
                  radius="xl"
                >
                  <Icon icon={icons.filter} height={20} />
                </ActionIcon>
              </Tooltip>
            </Popover.Target>
            <Popover.Dropdown mah={500} className="overflow-hidden">
              <FilterTree
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                filterTreeNodes={filterTreeNodes}
                isLoading={getFilterTreeAPI.isLoading}
              />
            </Popover.Dropdown>
          </Popover>
        </div>
      </div>
      {getInstrumentsAPI.isLoading ? (
        <Center className="h-full">
          <Stack align="center" gap="sm">
            <Loader size="lg" />
            <Text size="sm" c="dimmed">
              Loading companies...
            </Text>
          </Stack>
        </Center>
      ) : getInstrumentsAPI.data?.data?.instruments.length === 0 ? (
        <Center className="h-full">
          <Stack align="center" gap="sm">
            <Icon icon={icons.empty} height={64} className="opacity-30" />
            <Text size="sm" c="dimmed">
              No companies found
            </Text>
            {selectedCategories.length > 0 && (
              <Text size="xs" c="dimmed">
                Try adjusting your filters
              </Text>
            )}
          </Stack>
        </Center>
      ) : (
        <div className="h-full flex flex-col gap-2 overflow-auto">
          {getInstrumentsAPI.data?.data?.instruments.map((instrument) => (
            <CompanyCard
              key={instrument.id}
              name={instrument.name}
              symbol={instrument.symbol}
              exchange={instrument.exchange}
            />
          ))}
        </div>
      )}
    </div>
  );
};
