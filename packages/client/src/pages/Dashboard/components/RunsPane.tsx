import { Icon } from "@iconify/react";
import { Badge, Button, Divider, Paper, Text, Title } from "@mantine/core";
import { formatRelative } from "date-fns";

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
    <Paper withBorder p="md" className="w-full">
      <div className="flex flex-col gap-3">
        {/* Header: Name, Status, and Run Type */}
        <div className="flex items-center justify-between w-full gap-2">
          <Text fw={600} size="lg">
            {name}
          </Text>
          <div className="flex items-center gap-1">
            <Badge
              color={isActive ? "green" : "gray"}
              variant="light"
              size="sm"
            >
              {status}
            </Badge>
            <Badge color="blue" variant="outline" size="sm">
              {runType}
            </Badge>
          </div>
        </div>

        <Divider />

        {/* Time Information */}
        <div className="flex items-center justify-between w-full gap-2">
          <div>
            <Text size="xs" c="dimmed">
              Started At
            </Text>
            <Text size="sm">
              {startTime
                ? formatRelative(new Date(startTime), new Date())
                : "—"}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Ended At
            </Text>
            <Text size="sm">
              {endTime ? formatRelative(new Date(endTime), new Date()) : "—"}
            </Text>
          </div>
        </div>
        <Divider />
        {/* Balance Information */}
        <div className="flex items-center justify-between w-full gap-2">
          <div>
            <Text size="xs" c="dimmed">
              Starting Balance
            </Text>
            <Text size="sm" fw={500}>
              ₹{startingBalance.toLocaleString()}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Current Balance
            </Text>
            <Text size="sm" fw={500}>
              ₹{currentBalance.toLocaleString()}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Ending Balance
            </Text>
            <Text size="sm" fw={500}>
              {endingBalance ? `₹${endingBalance.toLocaleString()}` : "—"}
            </Text>
          </div>
        </div>
        <Divider />
        {/* Profit/Loss */}
        <div className="flex items-center justify-between w-full gap-2">
          <Text size="xs" c="dimmed">
            P&L
          </Text>
          <div className="flex items-center gap-1">
            <Text size="sm" fw={600} c={profitLoss >= 0 ? "green" : "red"}>
              {profitLoss >= 0 ? "+" : ""}₹{profitLoss.toLocaleString()}
            </Text>
            <Text size="xs" c={profitLoss >= 0 ? "green" : "red"}>
              ({profitLoss >= 0 ? "+" : ""}
              {profitLossPercentage}%)
            </Text>
          </div>
        </div>
      </div>
    </Paper>
  );
};

export const RunsPane = () => {
  // DRAW
  return (
    <Paper
      withBorder
      p="md"
      className="h-full w-full !grid grid-rows-[32px_1fr] gap-2"
    >
      <div className="flex items-center justify-between">
        <Title className="block" order={4}>
          Runs
        </Title>
        <Button
          variant="light"
          size="xs"
          leftSection={<Icon icon="mdi:plus" />}
        >
          Schedule Run
        </Button>
      </div>
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
    </Paper>
  );
};
