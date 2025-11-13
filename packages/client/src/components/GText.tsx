import { cn } from "@/lib/utils";
import { Tooltip, Text, type TextProps } from "@mantine/core";
import { useTimeout } from "@mantine/hooks";
import { useState } from "react";

const copyTextOnClick = (e: React.MouseEvent<HTMLParagraphElement>) => {
  e.preventDefault();
  e.stopPropagation();
  navigator.clipboard.writeText(e.currentTarget.textContent || "");
};

export const GText = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & TextProps) => {
  // STATE
  const [isCopied, setIsCopied] = useState(false);
  const { start } = useTimeout(() => setIsCopied(false), 1000);

  // DRAW
  return (
    <Tooltip
      label={isCopied ? "Copied to clipboard" : children?.toString() || ""}
      color={isCopied ? "green" : "dark"}
    >
      <Text
        onClick={(e) => {
          copyTextOnClick(e);
          setIsCopied(true);
          start();
        }}
        {...props}
        className={cn("w-fit cursor-text", props.className)}
      >
        {children}
      </Text>
    </Tooltip>
  );
};
