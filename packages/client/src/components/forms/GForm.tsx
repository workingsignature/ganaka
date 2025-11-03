import { Button, Drawer, LoadingOverlay } from "@mantine/core";
import { customZIndexes } from "@/utils/constants";

export const GForm = ({
  opened,
  children,
  title,
  primaryAction,
  onClose,
  onExitTransitionEnd,
  loading,
}: {
  opened: boolean;
  title: string;
  children: React.ReactNode;
  primaryAction: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
  onClose: () => void;
  onExitTransitionEnd: () => void;
  loading?: boolean;
}) => {
  // DRAW
  return (
    <Drawer.Root
      opened={opened}
      onClose={onClose}
      onExitTransitionEnd={onExitTransitionEnd}
      radius="md"
      position="right"
      offset={8}
    >
      <Drawer.Overlay />
      <Drawer.Content>
        <LoadingOverlay
          overlayProps={{ radius: "sm", blur: 0.1 }}
          zIndex={customZIndexes.loadingOverlay_GForm}
          visible={loading}
        />
        <Drawer.Header>
          <Drawer.Title>{title}</Drawer.Title>
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="filled"
              loading={primaryAction.loading}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
            <Drawer.CloseButton />
          </div>
        </Drawer.Header>
        <Drawer.Body>{children}</Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
};
