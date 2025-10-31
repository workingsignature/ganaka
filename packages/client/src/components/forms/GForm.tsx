import { Button, Drawer } from "@mantine/core";

export const GForm = ({
  opened,
  children,
  title,
  primaryAction,
  onClose,
  onExitTransitionEnd,
}: {
  opened: boolean;
  title: string;
  children: React.ReactNode;
  primaryAction: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
  onExitTransitionEnd: () => void;
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
        <Drawer.Header>
          <Drawer.Title>{title}</Drawer.Title>
          <div className="flex items-center justify-between gap-2">
            <Button variant="filled" onClick={primaryAction.onClick}>
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
