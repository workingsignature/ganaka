import dayjs from "dayjs";
import { RunItem, ScheduleDay, ExecutionTime } from "./types";

/**
 * Convert Date to day name (monday, tuesday, etc.)
 * Note: dayjs.day() returns 0 for Sunday, 1 for Monday, etc.
 * We map Sunday to monday as a fallback since schedules don't include Sunday
 */
export function getDayName(date: dayjs.Dayjs | Date): ScheduleDay {
  const dayIndex = dayjs(date).day();
  // day() returns: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  // Map to our ScheduleDay type (monday-friday)
  const dayMap: ScheduleDay[] = [
    "monday", // Sunday -> monday (fallback)
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "monday", // Saturday -> monday (fallback)
  ];
  return dayMap[dayIndex];
}

/**
 * Check if a time is within the schedule's startDateTime/endDateTime bounds
 */
export function isWithinScheduleBounds(
  time: dayjs.Dayjs | Date | string,
  startDateTime: string,
  endDateTime: string
): boolean {
  const timeDate = dayjs(time);
  const start = dayjs(startDateTime);
  const end = dayjs(endDateTime);
  return (
    (timeDate.isAfter(start) || timeDate.isSame(start)) &&
    (timeDate.isBefore(end) || timeDate.isSame(end))
  );
}

/**
 * Get all occurrences of a specific day between start and end dates
 */
function getDayOccurrences(
  dayName: ScheduleDay,
  startDate: dayjs.Dayjs | Date | string,
  endDate: dayjs.Dayjs | Date | string
): dayjs.Dayjs[] {
  const occurrences: dayjs.Dayjs[] = [];
  const dayMap: Record<ScheduleDay, number> = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
  };
  const targetDay = dayMap[dayName];

  const start = dayjs(startDate);
  const end = dayjs(endDate);

  // Start from the first occurrence of the target day on or after startDate
  let current = start;
  const currentDay = current.day();

  // Calculate days until target day (handles wrap-around to next week)
  const daysUntilTarget = (targetDay - currentDay + 7) % 7;

  // If daysUntilTarget is 0, we're already on the target day
  // Otherwise, add the days to reach the target day
  if (daysUntilTarget > 0) {
    current = current.add(daysUntilTarget, "day");
  }

  // Collect all occurrences of this day between start and end
  while (current.isBefore(end) || current.isSame(end)) {
    occurrences.push(current);
    current = current.add(1, "week"); // Move to next week
  }

  return occurrences;
}

/**
 * Extract time-of-day (hours, minutes, seconds) from an ISO datetime string
 */
function extractTimeOfDay(isoDateTime: string): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const date = dayjs(isoDateTime);
  return {
    hours: date.hour(),
    minutes: date.minute(),
    seconds: date.second(),
  };
}

/**
 * Generate all execution times from schedule timeslots
 * For each day in daywise schedule, find all occurrences between startDateTime and endDateTime,
 * then for each timeslot, generate times at interval (in minutes) using the time-of-day from the timeslot
 */
export function generateExecutionTimes(run: RunItem): ExecutionTime[] {
  const executionTimes: ExecutionTime[] = [];
  const schedule = run.schedule;
  const scheduleStart = dayjs(schedule.startDateTime);
  const scheduleEnd = dayjs(schedule.endDateTime);
  const days: ScheduleDay[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ];

  // For each day in the schedule
  for (const day of days) {
    const daySchedule = schedule.daywise[day];
    if (!daySchedule || daySchedule.timeslots.length === 0) {
      continue;
    }

    // Get all occurrences of this day between startDateTime and endDateTime
    const dayOccurrences = getDayOccurrences(day, scheduleStart, scheduleEnd);

    // For each occurrence of the day
    for (const dayDate of dayOccurrences) {
      // For each timeslot in the day schedule
      for (const timeslot of daySchedule.timeslots) {
        // Extract time-of-day from timeslot startTime and endTime
        const startTimeOfDay = extractTimeOfDay(timeslot.startTime);
        const endTimeOfDay = extractTimeOfDay(timeslot.endTime);
        const intervalMinutes = timeslot.interval;

        // Create start and end times for this specific timeslot
        const timeslotStart = dayDate
          .hour(startTimeOfDay.hours)
          .minute(startTimeOfDay.minutes)
          .second(startTimeOfDay.seconds)
          .millisecond(0);

        const timeslotEnd = dayDate
          .hour(endTimeOfDay.hours)
          .minute(endTimeOfDay.minutes)
          .second(endTimeOfDay.seconds)
          .millisecond(0);

        // Only process if this timeslot is within the overall schedule bounds
        if (
          timeslotStart.isAfter(scheduleEnd) ||
          timeslotEnd.isBefore(scheduleStart)
        ) {
          continue;
        }

        // Clamp timeslot to schedule bounds
        const actualStart = timeslotStart.isBefore(scheduleStart)
          ? scheduleStart
          : timeslotStart;
        const actualEnd = timeslotEnd.isAfter(scheduleEnd)
          ? scheduleEnd
          : timeslotEnd;

        // Generate execution times for this timeslot on this day occurrence
        let currentTime = actualStart;

        while (
          currentTime.isBefore(actualEnd) ||
          currentTime.isSame(actualEnd)
        ) {
          executionTimes.push({
            executionTime: currentTime.toISOString(),
            timeslot,
            day,
            shortlist: daySchedule.shortlist,
          });

          // Move to next interval
          currentTime = currentTime.add(intervalMinutes, "minute");
        }
      }
    }
  }

  // Sort by execution time
  executionTimes.sort(
    (a, b) =>
      dayjs(a.executionTime).valueOf() - dayjs(b.executionTime).valueOf()
  );

  return executionTimes;
}
