import {
  MiniCalendar,
  MiniCalendarNavigation,
  MiniCalendarDays,
  MiniCalendarDay,
} from "@/components/ui/shadcn-io/mini-calendar";
import { format, isValid, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const DateSelector = () => {
  // HOOKS
  const navigate = useNavigate();
  const { date: urlDate } = useParams();

  // STATE
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // HANDLERS
  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    // Update URL with the selected date
    const dateString = format(date, "yyyy-MM-dd");
    navigate(`/${dateString}`, { replace: true });
  };

  // EFFECTS
  // Parse date from URL on component mount
  useEffect(() => {
    if (urlDate) {
      try {
        const parsedDate = parseISO(urlDate);
        if (isValid(parsedDate)) {
          setSelectedDate(parsedDate);
        }
      } catch {
        console.warn("Invalid date in URL, using current date");
        setSelectedDate(new Date());
      }
    }
  }, [urlDate]);

  // DRAW
  return (
    <div className="max-w-[350px]">
      <MiniCalendar
        className="w-full"
        days={4}
        value={selectedDate}
        onValueChange={handleDateChange}
      >
        <MiniCalendarNavigation direction="prev" />
        <MiniCalendarDays className="w-full">
          {(date) => <MiniCalendarDay date={date} key={date.toISOString()} />}
        </MiniCalendarDays>
        <MiniCalendarNavigation direction="next" />
      </MiniCalendar>
    </div>
  );
};
