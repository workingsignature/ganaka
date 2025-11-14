import { GText } from "@/components/GText";
import { icons } from "@/components/icons";
import {
  useGetInstrumentsFilterTreeQuery,
  useGetInstrumentsQuery,
} from "@/store/api/instruments.api";
import { useAppSelector } from "@/utils/hooks/storeHooks";
import { useDraggable, type DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { CSS } from "@dnd-kit/utilities";
import { Icon } from "@iconify/react";
import {
  ActionIcon,
  Avatar,
  Button,
  Checkbox,
  Loader,
  Paper,
  Popover,
  Skeleton,
  Text,
  TextInput,
  Tooltip,
  Tree,
  type TreeNodeData,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { isEmpty, times } from "lodash";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";

export const CompanyCardContent = ({
  name,
  symbol,
  attributes,
  listeners,
  hideDragHandler = false,
  hideAddToShortlist = false,
}: {
  name: string;
  symbol: string;
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap | undefined;
  hideDragHandler?: boolean;
  hideAddToShortlist?: boolean;
}) => {
  // HOOKS
  const { selectedShortlists } = useAppSelector(
    (state) => state.shortlistsPage
  );

  // VARIABLES
  const isAddToShortlistDisabled = selectedShortlists.length === 0;

  // Determine grid columns based on what's hidden
  const getGridCols = () => {
    if (hideDragHandler && hideAddToShortlist) {
      return "grid-cols-[38px_1fr]";
    }
    if (hideDragHandler) {
      return "grid-cols-[38px_1fr_22px]";
    }
    if (hideAddToShortlist) {
      return "grid-cols-[20px_38px_1fr]";
    }
    return "grid-cols-[20px_38px_1fr_22px]";
  };

  // DRAW
  return (
    <div className={`w-full h-full grid gap-2 ${getGridCols()}`}>
      {!hideDragHandler && (
        <div
          className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          {...(attributes ? attributes : {})}
          {...(listeners ? listeners : {})}
        >
          <Icon icon={icons.drag} height={18} />
        </div>
      )}
      <div className="w-full h-full flex items-center justify-center">
        <Avatar
          src={`https://images.dhan.co/symbol/${symbol}.png`}
          size="md"
          name={name}
          color="initials"
          className="object-contain"
        />
      </div>
      <div className="flex items-start justify-between gap-2 ml-2">
        <div className="flex-1 min-w-0">
          <GText truncate="end" maw={150} fw={500} size="sm">
            {name}
          </GText>
          <GText maw={150} truncate="end" size="xs" c="dimmed" className="mt-1">
            {symbol}
          </GText>
        </div>
      </div>
      {!hideAddToShortlist && (
        <div className="w-full h-full flex items-center flex-col justify-center">
          <Popover>
            <Popover.Target>
              <Tooltip label="Add to shortlist">
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  radius="xs"
                  disabled={isAddToShortlistDisabled}
                >
                  <Icon icon={icons.add_to_shortlist} height={18} />
                </ActionIcon>
              </Tooltip>
            </Popover.Target>
            <Popover.Dropdown w={200} mah={200}>
              <div className="w-full h-full grid grid-rows"></div>
            </Popover.Dropdown>
          </Popover>
        </div>
      )}
    </div>
  );
};

const CompanyCard = ({
  id,
  name,
  symbol,
}: {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
}) => {
  // HOOKS
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `company-${id}`,
      data: {
        type: "company",
        instrumentId: id,
        name,
        symbol,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
  };

  // DRAW
  return (
    <Paper
      ref={setNodeRef}
      p="sm"
      withBorder
      shadow="xs"
      className="cursor-pointer"
      // overriding transform helps avoid pushing existing items
      // when dragging beyond the border of the current list
      style={{ ...style, touchAction: "none", transform: "none" }}
    >
      <CompanyCardContent
        name={name}
        symbol={symbol}
        attributes={attributes}
        listeners={listeners}
      />
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
  const treeIndentationInPx = 20;

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
    <div className="relative h-full">
      {selectedCategories.length > 0 && (
        <div className="absolute top-[-10px] right-[-10px] z-10">
          <Button
            variant="light"
            size="compact-xs"
            onClick={() => setSelectedCategories([])}
            leftSection={<Icon icon={icons.close} height={14} />}
          >
            Clear filters
          </Button>
        </div>
      )}
      <div className="overflow-y-auto h-full" style={{ maxHeight: "380px" }}>
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
                  className="flex items-center gap-1"
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
                  <GText size="sm">{node.label}</GText>
                </div>
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export const CompaniesTab = () => {
  // STATE
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);

  // API
  const getFilterTreeAPI = useGetInstrumentsFilterTreeQuery();
  const getInstrumentsAPI = useGetInstrumentsQuery({
    query: debouncedSearchQuery || undefined,
    categories:
      selectedCategories.length > 0 ? selectedCategories.join(",") : undefined,
    pageno: 1,
    pagesize: 50,
  });

  // VARIABLES
  const filterTreeNodes = useMemo(() => {
    return getFilterTreeAPI.data?.data?.tree || [];
  }, [getFilterTreeAPI.data]);

  // DRAW
  return (
    <div className="h-full w-full grid grid-rows-[40px_1fr] gap-2 overflow-hidden">
      <div className="w-full h-full flex justify-between gap-1 overflow-hidden">
        <div className="w-full h-full flex items-center justify-start">
          <TextInput
            placeholder="Search companies..."
            leftSection={<Icon icon={icons.search} />}
            rightSection={
              getInstrumentsAPI.isFetching && !isEmpty(searchQuery) ? (
                <Loader size="xs" />
              ) : undefined
            }
            className="w-full"
            classNames={{
              wrapper: "!mb-0",
            }}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
          />
        </div>
        <div className="flex items-center justify-end gap-1">
          <Tooltip label="Refresh Companies">
            <ActionIcon
              className="mt-auto mb-auto"
              variant="subtle"
              size="input-sm"
              color="dark"
            >
              {getInstrumentsAPI.isFetching ? (
                <Loader size="xs" />
              ) : (
                <Icon icon={icons.refresh} height={20} />
              )}
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Filter by Sector/Industry">
            <ActionIcon
              className="mt-auto mb-auto"
              variant="subtle"
              size="input-sm"
              color="dark"
              onClick={() => getInstrumentsAPI.refetch()}
            >
              <Icon icon={icons.sort} height={20} />
            </ActionIcon>
          </Tooltip>
          <Popover width={350} position="right-start">
            <Popover.Target>
              <Tooltip label="Filter by Sector/Industry">
                <ActionIcon
                  className="mt-auto mb-auto"
                  variant="subtle"
                  color="dark"
                  size="input-sm"
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
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader size="lg" />
            <Text size="sm" c="dimmed">
              Loading companies...
            </Text>
          </div>
        </div>
      ) : getInstrumentsAPI.data?.data?.instruments.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Icon icon={icons.empty} height={64} className="opacity-30" />
            <Text size="sm" c="dimmed">
              No companies found
            </Text>
            {(selectedCategories.length > 0 || debouncedSearchQuery) && (
              <Text size="xs" c="dimmed">
                Try adjusting your {selectedCategories.length > 0 && "filters"}
                {selectedCategories.length > 0 &&
                  debouncedSearchQuery &&
                  " or "}
                {debouncedSearchQuery && "search query"}
              </Text>
            )}
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col gap-2 overflow-auto">
          {getInstrumentsAPI.data?.data?.instruments.map((instrument) => (
            <CompanyCard
              key={instrument.id}
              id={instrument.id}
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
