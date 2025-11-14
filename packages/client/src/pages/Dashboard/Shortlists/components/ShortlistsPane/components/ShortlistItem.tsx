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
  Avatar,
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
  const { setNodeRef, isOver, active } = useDroppable({
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
        instruments: shortlist.instruments.map((instrument) => instrument.id),
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
        "cursor-pointer transition-all duration-200 min-h-20",
        isHovered && "hover-primary",
        showLoading && "opacity-75",
        active && "drop-zone-outline"
      )}
    >
      <div className="grid grid-cols-[20px_1fr_auto] gap-4">
        <Checkbox
          size="xs"
          radius="xl"
          checked={isSelected}
          className="mt-0.5 mb-auto"
        />
        <div className="flex flex-col gap-2">
          <GText fw={500} size="sm">
            {shortlist.name}
          </GText>
          {showLoading ? (
            <Loader size="xs" />
          ) : shortlist.instruments.length > 0 ? (
            <HoverCard
              width={280}
              shadow="md"
              openDelay={200}
              closeDelay={100}
              position="right-start"
            >
              <HoverCard.Target>
                <Avatar.Group
                  spacing="sm"
                  onClick={(e) => e.stopPropagation()}
                  className="cursor-pointer w-fit"
                >
                  {shortlist.instruments.slice(0, 5).map((instrument) => (
                    <Avatar
                      key={instrument.id}
                      src={`https://images.dhan.co/symbol/${instrument.symbol}.png`}
                      size="sm"
                      radius="xl"
                      alt={instrument.name}
                      color="initials"
                      className="!border !border-gray-200"
                    >
                      {instrument.name.charAt(0).toUpperCase()}
                    </Avatar>
                  ))}
                  {shortlist.instruments.length > 5 && (
                    <Avatar
                      size="sm"
                      radius="xl"
                      color="gray"
                      className="!border !border-gray-200"
                    >
                      +{shortlist.instruments.length - 5}
                    </Avatar>
                  )}
                </Avatar.Group>
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
                          instrumentId={instrument.id}
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
          ) : (
            <Text size="xs" c="dimmed">
              No companies
            </Text>
          )}
        </div>
        <div className="flex items-start gap-2">
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
