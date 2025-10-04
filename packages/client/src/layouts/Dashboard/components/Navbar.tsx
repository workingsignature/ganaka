import { gFormatDate } from "@/utils/helpers";
import { SignedIn, UserButton } from "@clerk/clerk-react";
import { Skeleton } from "@mantine/core";
import { MiniCalendar } from "@mantine/dates";
import { subDays } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const MiniCalendarView = () => {
  // HOOKS
  const miniCalendarParentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const urlParams = useParams();

  // STATE
  const [noOfDays, setNoOfDays] = useState(6);
  const [isLoading, setIsLoading] = useState(true);

  // HANDLERS
  const calculateDays = (clientWidth: number) => {
    setIsLoading(true);
    let dayWidth = 45;

    if (clientWidth < 500) {
      dayWidth = 60;
    } else if (clientWidth < 1000) {
      dayWidth = 50;
    }

    const days = Math.floor(clientWidth / dayWidth);
    setNoOfDays(Math.max(1, days)); // Ensure at least 1 day
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  const handleMiniCalendarChange = (date: string) => {
    navigate(`/${date}`);
  };

  // EFFECTS
  useEffect(() => {
    const element = miniCalendarParentRef.current;
    if (!element) return;

    // Calculate initial value
    calculateDays(element.clientWidth);

    // Create ResizeObserver to watch for size changes
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(() => {
        calculateDays(element.clientWidth);
      });
    });

    // Start observing the element
    resizeObserver.observe(element);

    // Cleanup function
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // DRAW
  return (
    <div
      ref={miniCalendarParentRef}
      className="w-full h-full flex items-center flex-1"
    >
      {isLoading ? (
        <Skeleton className="w-full !h-full" visible={true} />
      ) : (
        <MiniCalendar
          value={urlParams.date}
          maxDate={gFormatDate()}
          defaultDate={gFormatDate(
            subDays(
              urlParams.date ? new Date(urlParams.date) : new Date(),
              noOfDays - 1
            )
          )}
          onChange={handleMiniCalendarChange}
          numberOfDays={noOfDays}
        />
      )}
    </div>
  );
};

export const Navbar = () => {
  // DRAW
  return (
    <div className="w-full h-full px-2 rounded-sm flex flex-row items-center justify-between gap-8">
      <MiniCalendarView />
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
};
