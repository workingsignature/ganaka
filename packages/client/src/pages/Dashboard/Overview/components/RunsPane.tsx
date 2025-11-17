import { GPane } from "@/components/GPane";
import { icons } from "@/components/icons";
import { runsAPI } from "@/store/api/runs.api";
import { runFormSlice } from "@/store/forms/runFormSlice";
import { useAppDispatch, useAppSelector } from "@/utils/hooks/storeHooks";
import type { v1_core_strategies_versions_runs_schemas } from "@ganaka/server-schemas";
import { Icon } from "@iconify/react";
import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  HoverCard,
  Menu,
  Paper,
  Skeleton,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { debounce, times } from "lodash";
import type { z } from "zod";

dayjs.extend(relativeTime);

type RunItem = z.infer<
  typeof v1_core_strategies_versions_runs_schemas.runItemSchema
>;

const RunCard = ({
  run,
  onDelete,
  onEdit,
  isDeleting,
}: {
  run: RunItem;
  onDelete: () => void;
  onEdit: () => void;
  isDeleting: boolean;
}) => {
  const status = run.status;
  const profitLoss = run.currentBalance - run.startingBalance;
  const profitLossPercentage =
    run.startingBalance > 0
      ? ((profitLoss / run.startingBalance) * 100).toFixed(2)
      : "0.00";

  const startTime = run.schedule.startDateTime;
  const endTime = run.schedule.endDateTime;
  const runType = run.runType;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RUNNING":
        return "green";
      case "COMPLETED":
        return "blue";
      case "FAILED":
        return "red";
      case "CANCELLED":
        return "gray";
      case "PENDING":
        return "yellow";
      default:
        return "gray";
    }
  };

  return (
    <Paper withBorder p="md" pb="md" className="w-full">
      <div className="flex flex-col gap-3">
        {/* Header: ID, Status, and Run Type */}
        <div className="flex items-center justify-between w-full gap-2">
          <Text fw={600} size="lg" truncate="end" className="max-w-[200px]">
            {run.id}
          </Text>
          <div className="flex items-center gap-2">
            <Badge color={getStatusColor(status)} variant="light" size="sm">
              {status}
            </Badge>
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
                  onClick={onEdit}
                >
                  Edit
                </Menu.Item>
                <Menu.Item
                  color="red"
                  leftSection={<Icon icon={icons.delete} />}
                  onClick={onDelete}
                  disabled={isDeleting}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>

        <Divider />

        {/* Time Information */}
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex flex-col items-start justify-end">
            <Text size="xs" c="dimmed">
              Started At
            </Text>
            <Text size="sm">
              {startTime ? dayjs(startTime).fromNow() : "—"}
            </Text>
          </div>
          <div className="flex flex-col items-start justify-end">
            <Text size="xs" c="dimmed">
              Ended At
            </Text>
            <Text size="sm">{endTime ? dayjs(endTime).fromNow() : "—"}</Text>
          </div>
          <div className="flex flex-col items-end justify-end">
            <Text size="xs" c="dimmed">
              Created At
            </Text>
            <Text size="sm">
              {run.createdAt ? dayjs(run.createdAt).fromNow() : "—"}
            </Text>
          </div>
        </div>
        <Divider />
        {/* Balance Information */}
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex flex-col items-start justify-end">
            <Text size="xs" c="dimmed">
              Starting Balance
            </Text>
            <Text size="sm" fw={500}>
              ₹{run.startingBalance.toLocaleString()}
            </Text>
          </div>
          <div className="flex flex-col items-start justify-end">
            <Text size="xs" c="dimmed">
              Ending Balance
            </Text>
            <Text size="sm" fw={500}>
              {run.endingBalance
                ? `₹${run.endingBalance.toLocaleString()}`
                : "—"}
            </Text>
          </div>
          <div className="flex flex-col items-end justify-end">
            <Text size="xs" c="dimmed">
              P&L
            </Text>
            <div className="flex items-center gap-1">
              <Text
                className="block"
                size="sm"
                fw={600}
                c={profitLoss >= 0 ? "green" : "red"}
              >
                {profitLoss >= 0 ? "+" : ""}₹{profitLoss.toLocaleString()}
              </Text>
              <Text
                className="block"
                size="xs"
                c={profitLoss >= 0 ? "green" : "red"}
              >
                ({profitLoss >= 0 ? "+" : ""}
                {profitLossPercentage}%)
              </Text>
            </div>
          </div>
        </div>
        <Divider />
        {/* Run Type and Actions */}
        <div className="flex items-center justify-between w-full gap-2">
          <Badge color="blue" variant="outline" size="sm">
            {runType}
          </Badge>
          <ActionIcon.Group>
            <HoverCard width={280} shadow="md" position="right">
              <HoverCard.Target>
                <ActionIcon color="dark" variant="outline" size="md">
                  <Icon icon={icons.timeline} />
                </ActionIcon>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text size="sm">
                  Hover card is revealed when user hovers over target element,
                  it will be hidden once mouse is not over both target and
                  dropdown elements
                </Text>
              </HoverCard.Dropdown>
            </HoverCard>
            <HoverCard width={280} shadow="md" position="right">
              <HoverCard.Target>
                <ActionIcon color="dark" variant="outline" size="md">
                  <Icon icon={icons.shortlist} />
                </ActionIcon>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text size="sm">
                  Hover card is revealed when user hovers over target element,
                  it will be hidden once mouse is not over both target and
                  dropdown elements
                </Text>
              </HoverCard.Dropdown>
            </HoverCard>
          </ActionIcon.Group>
        </div>
      </div>
    </Paper>
  );
};

export const RunsPane = () => {
  // HOOKS
  const dispatch = useAppDispatch();
  const { strategyId, versionId } = useAppSelector((state) => state.runForm);

  // API
  const getRunsAPI = runsAPI.useGetRunsQuery(
    {
      strategyid: strategyId,
      versionid: versionId,
    },
    {
      skip: !strategyId || !versionId,
    }
  );
  const [deleteRun, deleteRunAPI] = runsAPI.useDeleteRunMutation();

  // HANDLERS
  const handleCreateRun = () => {
    if (!strategyId || !versionId) {
      notifications.show({
        title: "Error",
        message: "Please select a version first",
        color: "red",
      });
      return;
    }
    dispatch(runFormSlice.actions.setRunId(""));
    dispatch(runFormSlice.actions.setIsCreateMode(true));
    dispatch(runFormSlice.actions.setOpened(true));
  };
  const handleSearchOnChange = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
    },
    600
  );
  const handleEditRun = (runId: string) => {
    if (!strategyId || !versionId) return;
    dispatch(runFormSlice.actions.setRunId(runId));
    dispatch(runFormSlice.actions.setIsCreateMode(false));
    dispatch(runFormSlice.actions.setOpened(true));
  };
  const handleDeleteRun = (runId: string) => {
    if (!strategyId || !versionId) return;

    modals.openConfirmModal({
      title: "Delete Run",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete this run? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: "Delete Run", cancel: "Cancel" },
      confirmProps: { color: "red", loading: deleteRunAPI.isLoading },
      onConfirm: async () => {
        const response = await deleteRun({
          strategyid: strategyId,
          versionid: versionId,
          id: runId,
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
    <GPane
      title="Runs"
      onSearchChange={handleSearchOnChange}
      searchPlaceholder="Search Runs"
      titleActions={
        <Button
          variant="light"
          size="xs"
          leftSection={<Icon icon={icons.create} />}
          onClick={handleCreateRun}
          disabled={!strategyId || !versionId}
        >
          Schedule Run
        </Button>
      }
    >
      {!strategyId || !versionId ? (
        <div className="h-full w-full flex flex-col items-center justify-center gap-5">
          <Icon icon={icons.empty} height={60} />
          <Text size="md" c="dimmed" ta="center">
            No version selected.
            <br />
            Select a version to view runs.
          </Text>
        </div>
      ) : getRunsAPI.isLoading ? (
        <div className="h-full w-full flex flex-col gap-2">
          {times(3, (index) => (
            <Skeleton animate key={index} height={200} radius="sm" />
          ))}
        </div>
      ) : getRunsAPI.data && getRunsAPI.data.data.length > 0 ? (
        <div className="flex flex-col gap-3">
          {getRunsAPI.data.data.map((run) => (
            <RunCard
              key={run.id}
              run={run}
              onDelete={() => handleDeleteRun(run.id)}
              onEdit={() => handleEditRun(run.id)}
              isDeleting={deleteRunAPI.isLoading}
            />
          ))}
        </div>
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center gap-5">
          <Icon icon={icons.empty} height={60} />
          <Text size="md" c="dimmed" ta="center">
            No runs found.
            <br />
            Create a new run to get started.
          </Text>
        </div>
      )}
    </GPane>
  );
};
