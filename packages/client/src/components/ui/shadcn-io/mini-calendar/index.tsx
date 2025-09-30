"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import {
  addDays,
  format,
  isSameDay,
  isToday,
  subDays,
  isWeekend,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Slot } from "radix-ui";
import {
  type ButtonHTMLAttributes,
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  useContext,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Context for sharing state between components
type MiniCalendarContextType = {
  selectedDate: Date | null | undefined;
  onDateSelect: (date: Date) => void;
  startDate: Date;
  onNavigate: (direction: "prev" | "next") => void;
  days: number;
};

const MiniCalendarContext = createContext<MiniCalendarContextType | null>(null);

const useMiniCalendar = () => {
  const context = useContext(MiniCalendarContext);

  if (!context) {
    throw new Error("MiniCalendar components must be used within MiniCalendar");
  }

  return context;
};

// Helper function to get array of consecutive dates
const getDays = (startDate: Date, count: number): Date[] => {
  const days: Date[] = [];
  for (let i = count; i >= 0; i--) {
    days.push(subDays(startDate, i));
  }
  return days;
};

// Helper function to format date
const formatDate = (date: Date) => {
  const month = format(date, "MMM");
  const day = format(date, "d");
  const dayOfWeek = format(date, "EEE");

  return { month, day, dayOfWeek };
};

export type MiniCalendarProps = HTMLAttributes<HTMLDivElement> & {
  value?: Date;
  onValueChange?: (date: Date | undefined) => void;
  startDate?: Date;
  defaultStartDate?: Date;
  onStartDateChange?: (date: Date | undefined) => void;
  days?: number;
};

export const MiniCalendar = ({
  value,
  onValueChange,
  startDate,
  defaultStartDate = new Date(),
  onStartDateChange,
  days = 5,
  className,
  children,
  ...props
}: MiniCalendarProps) => {
  const [selectedDate, setSelectedDate] = useControllableState<
    Date | undefined
  >({
    prop: value,
    defaultProp: new Date(),
    onChange: onValueChange,
  });

  const [currentStartDate, setCurrentStartDate] = useControllableState({
    prop: startDate,
    defaultProp: defaultStartDate,
    onChange: onStartDateChange,
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleNavigate = (direction: "prev" | "next") => {
    const newStartDate = addDays(
      currentStartDate || new Date(),
      direction === "next" ? days : -days
    );
    setCurrentStartDate(newStartDate);
  };

  const contextValue: MiniCalendarContextType = {
    selectedDate: selectedDate || null,
    onDateSelect: handleDateSelect,
    startDate: currentStartDate || new Date(),
    onNavigate: handleNavigate,
    days,
  };

  return (
    <MiniCalendarContext.Provider value={contextValue}>
      <div
        className={cn(
          "flex items-center rounded-lg border bg-background p-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </MiniCalendarContext.Provider>
  );
};

export type MiniCalendarNavigationProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    direction: "prev" | "next";
    asChild?: boolean;
  };

export const MiniCalendarNavigation = ({
  direction,
  asChild = false,
  children,
  onClick,
  ...props
}: MiniCalendarNavigationProps) => {
  const { onNavigate, startDate, days: dayCount } = useMiniCalendar();
  const Icon = direction === "prev" ? ChevronLeftIcon : ChevronRightIcon;

  if (direction === "next") {
    const days = getDays(startDate, dayCount);
    const isLastDayCurrentDate = isSameDay(days[days.length - 1], new Date());
    if (isLastDayCurrentDate) {
      props.disabled = true;
    }
  }

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onNavigate(direction);
    onClick?.(event);
  };

  if (asChild) {
    return (
      <Slot.Root onClick={handleClick} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <Button
      onClick={handleClick}
      size={asChild ? undefined : "icon"}
      type="button"
      variant={asChild ? undefined : "ghost"}
      {...props}
    >
      {children ?? <Icon className="size-4" />}
    </Button>
  );
};

export type MiniCalendarDaysProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  children: (date: Date) => ReactNode;
};

export const MiniCalendarDays = ({
  className,
  children,
  ...props
}: MiniCalendarDaysProps) => {
  const { startDate, days: dayCount } = useMiniCalendar();
  const days = getDays(startDate, dayCount);

  return (
    <div
      className={cn("flex items-center gap-1 overflow-auto", className)}
      {...props}
    >
      {days.map((date) => children(date))}
    </div>
  );
};

export type MiniCalendarDayProps = ComponentProps<typeof Button> & {
  date: Date;
};

export const MiniCalendarDay = ({
  date,
  className,
  ...props
}: MiniCalendarDayProps) => {
  const { selectedDate, onDateSelect } = useMiniCalendar();
  const { day, dayOfWeek } = formatDate(date);
  const isSelected = selectedDate && isSameDay(date, selectedDate);
  const isWeekendDate = isWeekend(date);
  const isTodayDate = isToday(date);

  return (
    <Button
      className={cn(
        "h-auto min-w-[3rem] flex-col gap-0 p-2 text-xs",
        isWeekendDate && "text-gray-400",
        isTodayDate && !isSelected && "bg-accent",
        className
      )}
      onClick={() => onDateSelect(date)}
      size="sm"
      type="button"
      variant={isSelected ? "default" : "ghost"}
      {...props}
    >
      <span
        className={cn(
          "font-medium text-[10px] text-muted-foreground",
          isWeekendDate && "text-gray-400",
          isSelected && "text-primary-foreground/70"
        )}
      >
        {dayOfWeek}
      </span>
      <span className="font-semibold text-sm">{day}</span>
    </Button>
  );
};
