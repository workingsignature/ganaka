import { Paper, Text } from "@mantine/core";

export const CollapsiblePanel = ({
  children,
  title,
  containerClassName,
}: {
  children: React.ReactNode;
  title: string;
  containerClassName?: string;
}) => {
  // DRAW
  return (
    <Paper className={containerClassName} withBorder>
      <div className="w-full h-full grid grid-rows-[40px_1fr] px-3 pb-3">
        <div className="w-full h-full flex items-center">
          <Text fw={500}>{title}</Text>
        </div>
        <div className="w-full h-full overflow-hidden">{children}</div>
      </div>
    </Paper>
  );
};
