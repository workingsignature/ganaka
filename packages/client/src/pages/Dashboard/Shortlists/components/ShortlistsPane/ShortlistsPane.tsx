import { GPane } from "@/components/GPane";
import { icons } from "@/components/icons";
import { shortlistsAPI } from "@/store/api/shortlists.api";
import { shortlistFormSlice } from "@/store/forms/shortlistFormSlice";
import { useAppDispatch } from "@/utils/hooks/storeHooks";
import { Icon } from "@iconify/react";
import { ActionIcon, Skeleton, Text, Tooltip } from "@mantine/core";
import { debounce, times } from "lodash";
import { useRef } from "react";
import { ShortlistItem } from "./components/ShortlistItem";

export const ShortlistsPane = ({
  overId,
  updatingShortlistId,
}: {
  overId: string | null;
  updatingShortlistId: string | null;
}) => {
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
            <ShortlistItem
              key={shortlist.id}
              shortlist={shortlist}
              overId={overId}
              isUpdating={updatingShortlistId === shortlist.id}
            />
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
