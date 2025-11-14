import { GText } from "@/components/GText";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { shortlistsAPI } from "@/store/api/shortlists.api";
import { shortlistFormSlice } from "@/store/forms/shortlistFormSlice";
import { shortlistsPageSlice } from "@/store/pages/shortlistsPageSlice";
import { useAppDispatch, useAppSelector } from "@/utils/hooks/storeHooks";
import { useDroppable } from "@dnd-kit/core";
import type { v1_core_shortlists_schemas } from "@ganaka/server-schemas";
import { Icon } from "@iconify/react";
import {
  ActionIcon,
  Badge,
  Checkbox,
  HoverCard,
  Loader,
  Menu,
  Paper,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import type z from "zod";
import { CompanyCardContent } from "../../CompaniesPane/components/CompaniesTab";

export const ShortlistItem = ({
  shortlist,
  overId,
  isUpdating,
}: {
  shortlist: z.infer<typeof v1_core_shortlists_schemas.shortlistItemSchema>;
  overId: string | null;
  isUpdating: boolean;
}) => {
  // HOOKS
  const dispatch = useAppDispatch();
  const { setNodeRef, isOver } = useDroppable({
    id: `shortlist-${shortlist.id}`,
    data: {
      type: "shortlist",
      shortlistId: shortlist.id,
      shortlist,
    },
  });

  // STATE
  const { selectedShortlists } = useAppSelector(
    (state) => state.shortlistsPage
  );

  // API
  const [deleteShortlist, deleteShortlistAPI] =
    shortlistsAPI.useDeleteShortlistMutation();

  // VARIABLES
  const isSelected = selectedShortlists.some(
    (selectedShortlist) => selectedShortlist.id === shortlist.id
  );

  // HANDLERS
  const handleEdit = () => {
    dispatch(shortlistFormSlice.actions.setIsCreateMode(false));
    dispatch(shortlistFormSlice.actions.setShortlistId(shortlist.id));
    dispatch(shortlistFormSlice.actions.setOpened(true));
  };
  const handleDelete = () => {
    modals.openConfirmModal({
      title: `Delete Shortlist "${shortlist.name}"`,
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete this shortlist? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: "Delete Shortlist", cancel: "No, don't delete it" },
      confirmProps: { color: "red", loading: deleteShortlistAPI.isLoading },
      onConfirm: async () => {
        const response = await deleteShortlist({
          id: shortlist.id,
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
  const handleClick = () => {
    dispatch(
      shortlistsPageSlice.actions.toggleSelectedShortlist({
        id: shortlist.id,
        name: shortlist.name,
      })
    );
  };

  // VARIABLES
  const isHovered = overId === `shortlist-${shortlist.id}` && isOver;
  const showLoading = isUpdating;

  // DRAW
  return (
    <Paper
      ref={setNodeRef}
      p="sm"
      withBorder
      shadow="xs"
      onClick={handleClick}
      className={cn(
        "cursor-pointer transition-all duration-200",
        isHovered && "hover-primary",
        showLoading && "opacity-75"
      )}
    >
      <div className="grid grid-cols-[20px_1fr_auto] gap-4">
        <Checkbox
          size="xs"
          radius="xl"
          checked={isSelected}
          className="mt-auto mb-auto"
        />
        <div className="mt-auto mb-auto flex items-center gap-2">
          <GText fw={500} size="sm">
            {shortlist.name}
          </GText>
        </div>
        <div className="flex items-center gap-2">
          <HoverCard
            width={280}
            shadow="md"
            openDelay={200}
            closeDelay={100}
            withArrow
          >
            <HoverCard.Target>
              {showLoading ? (
                <Loader size="xs" />
              ) : (
                <Badge
                  variant="light"
                  className="cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {shortlist.instruments.length}
                </Badge>
              )}
            </HoverCard.Target>
            <HoverCard.Dropdown onClick={(e) => e.stopPropagation()} p="xs">
              {shortlist.instruments.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {shortlist.instruments.map((instrument) => (
                    <Paper
                      key={instrument.id}
                      p="xs"
                      withBorder
                      shadow="xs"
                      className="w-full"
                    >
                      <CompanyCardContent
                        name={instrument.name}
                        symbol={instrument.symbol}
                        hideDragHandler={true}
                        hideAddToShortlist={true}
                      />
                    </Paper>
                  ))}
                </div>
              ) : (
                <Text size="sm" c="dimmed">
                  No companies in this shortlist
                </Text>
              )}
            </HoverCard.Dropdown>
          </HoverCard>
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
              <Menu.Item
                leftSection={<Icon icon={icons.edit} />}
                onClick={() => handleEdit()}
              >
                Edit Shortlist
              </Menu.Item>
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
    </Paper>
  );
};
