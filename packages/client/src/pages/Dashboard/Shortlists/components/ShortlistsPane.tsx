import { GPane } from "@/components/GPane";
import { icons } from "@/components/icons";
import { shortlistsAPI } from "@/store/api/shortlists.api";
import { shortlistFormSlice } from "@/store/forms/shortlistFormSlice";
import { useAppDispatch } from "@/utils/hooks/storeHooks";
import type { v1_core_shortlists_schemas } from "@ganaka/server-schemas";
import { Icon } from "@iconify/react";
import {
  ActionIcon,
  Badge,
  Menu,
  Paper,
  Skeleton,
  Text,
  Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { debounce, times } from "lodash";
import { useRef } from "react";
import type z from "zod";

const ShortlistItem = ({
  shortlist,
}: {
  shortlist: z.infer<typeof v1_core_shortlists_schemas.shortlistItemSchema>;
}) => {
  // HOOKS
  const dispatch = useAppDispatch();

  // API
  const [deleteShortlist, deleteShortlistAPI] =
    shortlistsAPI.useDeleteShortlistMutation();

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

  // DRAW
  return (
    <Paper>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Icon className="mt-0.5" icon={icons.shortlist_item} height={16} />
          <Text fw={600} size="sm" className="block max-w-40" truncate="end">
            {shortlist.name}
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="light">{shortlist.instruments.length}</Badge>
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

export const ShortlistsPane = () => {
  // HOOKS
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  // API
  const getAllShortlistsAPI = shortlistsAPI.useGetShortlistsQuery();

  // HANDLERS
  const handleRefreshShortlists = () => {
    getAllShortlistsAPI.refetch();
  };
  const handleCreateShortlist = () => {
    dispatch(shortlistFormSlice.actions.setOpened(true));
  };
  const handleSearchOnChange = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      if (event.target.value) {
        searchInputRef.current?.select();
      }
    },
    600
  );

  // DRAW
  return (
    <GPane
      title="Shortlists"
      onSearchChange={handleSearchOnChange}
      searchPlaceholder="Search Shortlists"
      titleActions={
        <div className="flex items-center justify-end">
          <Tooltip label="Refresh Shortlists">
            <ActionIcon
              variant="subtle"
              size="lg"
              color="dark"
              onClick={handleRefreshShortlists}
            >
              <Icon icon={icons.refresh} height={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Sort Shortlists">
            <ActionIcon
              variant="subtle"
              size="lg"
              color="dark"
              onClick={handleCreateShortlist}
            >
              <Icon icon={icons.sort} height={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Filter Shortlists">
            <ActionIcon
              variant="subtle"
              size="lg"
              color="dark"
              className="mr-2"
              onClick={handleCreateShortlist}
            >
              <Icon icon={icons.filter} height={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Create Shortlist">
            <ActionIcon
              variant="light"
              size="md"
              onClick={handleCreateShortlist}
            >
              <Icon icon={icons.create} />
            </ActionIcon>
          </Tooltip>
        </div>
      }
    >
      {getAllShortlistsAPI.isLoading ? (
        <div className="h-full w-full flex flex-col gap-2">
          {times(10, (index) => (
            <Skeleton animate key={index} height={28} radius="sm" />
          ))}
        </div>
      ) : getAllShortlistsAPI.data &&
        getAllShortlistsAPI.data.data.length > 0 ? (
        <div className="h-full w-full flex flex-col gap-2">
          {getAllShortlistsAPI.data.data.map((shortlist) => (
            <ShortlistItem key={shortlist.id} shortlist={shortlist} />
          ))}
        </div>
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center gap-5">
          <Icon icon={icons.empty} height={60} />
          <Text size="md" c="dimmed" ta="center">
            No shortlists found.
            <br />
            Create a new shortlist to get started.
          </Text>
        </div>
      )}
    </GPane>
  );
};
