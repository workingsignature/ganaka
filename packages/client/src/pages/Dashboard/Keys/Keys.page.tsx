import { GPane } from "@/components/GPane";
import { GText } from "@/components/GText";
import { icons } from "@/components/icons";
import { keysApi } from "@/store/api/keys.api";
import { keyFormSlice } from "@/store/forms/keyFormSlice";
import { useAppDispatch } from "@/utils/hooks/storeHooks";
import { Icon } from "@iconify/react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Menu,
  Paper,
  Skeleton,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import { times } from "lodash";
import type { z } from "zod";
import { v1_core_keys_schemas } from "@ganaka/server-schemas";

type DeveloperKeyItem = z.infer<
  typeof v1_core_keys_schemas.developerKeyItemSchema
>;

const KeyCard = ({
  keyItem,
  onDeactivate,
  isDeactivating,
}: {
  keyItem: DeveloperKeyItem;
  onDeactivate: () => void;
  isDeactivating: boolean;
}) => {
  // VARIABLES
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "INACTIVE":
        return "gray";
      case "EXPIRED":
        return "red";
      default:
        return "gray";
    }
  };

  const formatDate = (date: Date | string) => {
    return dayjs(date).format("MMM D, YYYY");
  };

  const keyName = (keyItem as DeveloperKeyItem & { name: string }).name;
  const keyDescription = (
    keyItem as DeveloperKeyItem & {
      description: string;
    }
  ).description;
  const isInactive =
    keyItem.status === "INACTIVE" || keyItem.status === "EXPIRED";

  return (
    <Paper withBorder p="sm" className="w-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <Group gap="xs" wrap="nowrap">
            <Badge
              color={getStatusColor(keyItem.status)}
              variant="light"
              size="sm"
            >
              {keyItem.status}
            </Badge>
            <Text size="sm" fw={500} className="truncate">
              {keyName}
            </Text>
          </Group>
          {keyDescription && (
            <Text size="xs" c="dimmed" lineClamp={1}>
              {keyDescription}
            </Text>
          )}
          <GText
            size="xs"
            fw={500}
            className={`font-mono break-all flex-1 ${
              isInactive ? "line-through opacity-60" : ""
            }`}
          >
            {keyItem.key}
          </GText>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {keyItem.status === "ACTIVE" && (
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="sm">
                  <Icon icon={icons.menu} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  color="red"
                  leftSection={<Icon icon={icons.delete} />}
                  onClick={onDeactivate}
                  disabled={isDeactivating}
                >
                  Deactivate
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
          <div className="flex flex-col items-end gap-0.5">
            <Text size="xs" c="dimmed" ta="right">
              Created: {formatDate(keyItem.createdAt)}
            </Text>
            {isInactive && (
              <Text size="xs" c="dimmed" ta="right">
                Deactivated: {formatDate(keyItem.updatedAt)}
              </Text>
            )}
          </div>
        </div>
      </div>
    </Paper>
  );
};

export const KeysPage = () => {
  // HOOKS
  const dispatch = useAppDispatch();

  // API
  const { data: keysData, isLoading: isLoadingKeys } =
    keysApi.useGetKeysQuery();
  const [deactivateKey, { isLoading: isDeactivatingKey }] =
    keysApi.useDeactivateKeyMutation();

  // HANDLERS
  const handleCreateKey = () => {
    dispatch(keyFormSlice.actions.setIsCreateMode(true));
    dispatch(keyFormSlice.actions.setOpened(true));
  };

  const handleDeactivateKey = (keyId: string) => {
    modals.openConfirmModal({
      title: "Deactivate Key",
      children: (
        <Text size="sm">
          Are you sure you want to deactivate this key? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: "Deactivate", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          const response = await deactivateKey({ id: keyId }).unwrap();
          if (response.data) {
            notifications.show({
              title: "Success",
              message: "Developer key deactivated successfully",
              color: "green",
            });
          }
        } catch (error) {
          console.error(error);
          notifications.show({
            title: "Error",
            message: "Failed to deactivate developer key",
            color: "red",
          });
        }
      },
    });
  };

  // DRAW
  return (
    <div className="w-full h-full overflow-hidden flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto h-full">
        <GPane
          title="Developer Keys"
          titleActions={
            <Button
              variant="light"
              size="xs"
              leftSection={<Icon icon={icons.create} />}
              onClick={handleCreateKey}
            >
              Create Key
            </Button>
          }
        >
          {isLoadingKeys ? (
            <div className="h-full w-full flex flex-col gap-2">
              {times(3, (index) => (
                <Skeleton animate key={index} height={80} radius="sm" />
              ))}
            </div>
          ) : keysData && keysData.data.length > 0 ? (
            <div className="flex flex-col gap-2">
              {keysData.data.map((keyItem: DeveloperKeyItem) => (
                <KeyCard
                  key={keyItem.id}
                  keyItem={keyItem}
                  onDeactivate={() => handleDeactivateKey(keyItem.id)}
                  isDeactivating={isDeactivatingKey}
                />
              ))}
            </div>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center gap-5">
              <Icon icon={icons.empty} height={60} />
              <Text size="md" c="dimmed" ta="center">
                No keys found.
                <br />
                Create a new key to get started.
              </Text>
            </div>
          )}
        </GPane>
      </div>
    </div>
  );
};
