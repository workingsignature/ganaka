import { GPane } from "@/components/GPane";
import { icons } from "@/components/icons";
import { shortlistsAPI } from "@/store/api/shortlists.api";
import { shortlistFormSlice } from "@/store/forms/shortlistFormSlice";
import { useAppDispatch } from "@/utils/hooks/storeHooks";
import { Icon } from "@iconify/react";
import { ActionIcon, Skeleton, Text, Tooltip } from "@mantine/core";
import { debounce, times } from "lodash";
import { useRef } from "react";

// const ShortlistItem = ({
//   shortlist,
// }: {
//   shortlist: z.infer<typeof v1_core_shortlists_schemas.shortlistItemSchema>;
// }) => {
//   const maxPreviewInstruments = 5;
//   const previewInstruments = shortlist.instruments.slice(
//     0,
//     maxPreviewInstruments
//   );
//   const remainingCount = Math.max(
//     0,
//     shortlist.instruments.length - maxPreviewInstruments
//   );

//   return (
//     <Card
//       shadow="sm"
//       padding="lg"
//       radius="md"
//       withBorder
//       className="hover:shadow-md transition-shadow cursor-pointer"
//     >
//       <Stack gap="md">
//         {/* Header */}
//         <Group justify="space-between" align="center">
//           <Group gap="xs">
//             <Icon
//               icon={icons.shortlist}
//               className="text-blue-600"
//               width={20}
//               height={20}
//             />
//             <Text fw={600} size="lg">
//               {shortlist.name}
//             </Text>
//           </Group>
//           <Badge color="blue" variant="light">
//             {shortlist.instruments.length}{" "}
//             {shortlist.instruments.length === 1 ? "instrument" : "instruments"}
//           </Badge>
//         </Group>

//         {/* Instruments Preview */}
//         {shortlist.instruments.length > 0 && (
//           <div>
//             <Text size="xs" c="dimmed" mb={8}>
//               Instruments
//             </Text>
//             <Group gap="xs">
//               {previewInstruments.map((instrument) => (
//                 <Badge key={instrument.id} variant="dot" color="gray" size="sm">
//                   {instrument.name}
//                 </Badge>
//               ))}
//               {remainingCount > 0 && (
//                 <Badge variant="filled" color="gray" size="sm">
//                   +{remainingCount} more
//                 </Badge>
//               )}
//             </Group>
//           </div>
//         )}

//         {/* Empty state */}
//         {shortlist.instruments.length === 0 && (
//           <Text size="sm" c="dimmed" fs="italic">
//             No instruments added yet
//           </Text>
//         )}
//       </Stack>
//     </Card>
//   );
// };

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
        <div className="h-full w-full"></div>
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
