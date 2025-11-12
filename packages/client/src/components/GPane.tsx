import { Icon } from "@iconify/react";
import { Input, Paper, Title } from "@mantine/core";
import { useRef } from "react";
import { icons } from "./icons";
import clsx from "clsx";

export const GPane = ({
  children,
  title,
  titleActions,
  searchPlaceholder = "Search",
  onSearchChange,
}: {
  children: React.ReactNode;
  title: string;
  searchPlaceholder?: string;
  titleActions?: React.ReactNode;
  onSearchChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  // HOOKS
  const searchInputRef = useRef<HTMLInputElement>(null);

  // DRAW
  return (
    <Paper
      withBorder
      p="md"
      className={clsx(
        "h-full w-full !grid gap-2 overflow-hidden",
        onSearchChange ? "grid-rows-[32px_36px_1fr]" : "grid-rows-[32px_1fr]"
      )}
    >
      <div className="flex items-center justify-between">
        <Title className="block" order={4}>
          {title}
        </Title>
        {titleActions}
      </div>
      {onSearchChange ? (
        <div className="w-full h-full">
          <Input
            ref={searchInputRef}
            placeholder={searchPlaceholder}
            className="w-full"
            leftSection={<Icon icon={icons.search} />}
            onChange={onSearchChange}
            onFocus={(e) => {
              e.target.select();
            }}
          />
        </div>
      ) : null}
      <div className="w-full h-full overflow-hidden">{children}</div>
    </Paper>
  );
};
