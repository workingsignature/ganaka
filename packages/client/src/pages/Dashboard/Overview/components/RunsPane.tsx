import { GPane } from "@/components/GPane";
import { icons } from "@/components/icons";
import { runFormSlice } from "@/store/forms/runFormSlice";
import { useAppDispatch } from "@/utils/hooks/storeHooks";
import { Icon } from "@iconify/react";
import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  HoverCard,
  Menu,
  Paper,
  Text,
} from "@mantine/core";
import { formatRelative } from "date-fns";
import { debounce } from "lodash";

const RunCard = ({
  name,
  status,
  startTime,
  endTime,
  currentBalance,
  startingBalance,
  endingBalance,
  runType,
}: {
  name: string;
  status: string;
  startTime: string;
  endTime: string;
  currentBalance: number;
  startingBalance: number;
  endingBalance: number;
  runType: string;
}) => {
  const isActive = status.toLowerCase() === "active";
  const profitLoss = currentBalance - startingBalance;
  const profitLossPercentage = ((profitLoss / startingBalance) * 100).toFixed(
    2
  );

  return (
    <Paper withBorder p="md" pb="md" className="w-full">
      <div className="flex flex-col gap-3">
        {/* Header: Name, Status, and Run Type */}
        <div className="flex items-center justify-between w-full gap-2">
          <Text fw={600} size="lg">
            {name}
          </Text>
          <div className="flex items-center gap-2">
            <Badge
              color={isActive ? "green" : "gray"}
              variant="light"
              size="sm"
            >
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
                <Menu.Item leftSection={<Icon icon={icons.rename} />}>
                  Rename
                </Menu.Item>
                <Menu.Item leftSection={<Icon icon={icons.clone} />}>
                  Clone
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

        <Divider />

        {/* Time Information */}
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex flex-col items-start justify-end">
            <Text size="xs" c="dimmed">
              Started At
            </Text>
            <Text size="sm">
              {startTime
                ? formatRelative(new Date(startTime), new Date())
                : "—"}
            </Text>
          </div>
          <div className="flex flex-col items-start justify-end">
            <Text size="xs" c="dimmed">
              Ended At
            </Text>
            <Text size="sm">
              {endTime ? formatRelative(new Date(endTime), new Date()) : "—"}
            </Text>
          </div>
          <div className="flex flex-col items-end justify-end">
            <Text size="xs" c="dimmed">
              Frequency
            </Text>
            <Text size="sm">5 min</Text>
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
              ₹{startingBalance.toLocaleString()}
            </Text>
          </div>
          <div className="flex flex-col items-start justify-end">
            <Text size="xs" c="dimmed">
              Ending Balance
            </Text>
            <Text size="sm" fw={500}>
              {endingBalance ? `₹${endingBalance.toLocaleString()}` : "—"}
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
        {/* Profit/Loss */}
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

  // HANDLERS
  const handleCreateRun = () => {
    dispatch(runFormSlice.actions.setOpened(true));
  };
  const handleSearchOnChange = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
    },
    600
  );

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
        >
          Schedule Run
        </Button>
      }
    >
      <div>
        <RunCard
          name="Run 1"
          status="Active"
          startTime="2025-01-01 12:00:00"
          endTime="2025-01-01 12:00:00"
          currentBalance={10000}
          startingBalance={10000}
          endingBalance={10000}
          runType="Backtest"
        />
      </div>
    </GPane>
  );
};
