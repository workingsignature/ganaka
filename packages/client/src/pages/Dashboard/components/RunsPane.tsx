import {
  Paper,
  Title,
  Badge,
  Text,
  Group,
  Stack,
  Divider,
} from "@mantine/core";
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
    <Paper
      withBorder
      p="md"
      className="w-full hover:shadow-md transition-shadow"
    >
      <Stack gap="sm">
        {/* Header: Name, Status, and Run Type */}
        <Group justify="space-between" align="center">
          <Text fw={600} size="lg">
            {name}
          </Text>
          <Group gap="xs">
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
          </Group>
        </Group>

        <Divider />

        {/* Time Information */}
        <Group justify="space-between" grow>
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
        </Group>

        <Divider />

        {/* Balance Information */}
        <div className="grid grid-cols-3 gap-4">
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

        {/* Profit/Loss */}
        <Group justify="space-between" className="mt-2">
          <Text size="xs" c="dimmed">
            P&L
          </Text>
          <Group gap="xs">
            <Text size="sm" fw={600} c={profitLoss >= 0 ? "green" : "red"}>
              {profitLoss >= 0 ? "+" : ""}₹{profitLoss.toLocaleString()}
            </Text>
            <Text size="xs" c={profitLoss >= 0 ? "green" : "red"}>
              ({profitLoss >= 0 ? "+" : ""}
              {profitLossPercentage}%)
            </Text>
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
};

export const RunsPane = () => {
  // DRAW
  return (
    <Paper
      withBorder
      p="md"
      className="h-full w-full !grid grid-rows-[20px_1fr] gap-2"
    >
      <div className="flex items-center justify-between">
        <Title order={4}>Runs</Title>
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
