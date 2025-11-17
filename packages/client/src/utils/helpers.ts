import dayjs from "dayjs";

/**
 * Format a date to YYYY-MM-DD
 * @param date - The date to format (optional)
 * @default - The current date
 * @returns The formatted date
 */
export const gFormatDate = (date?: Date) => {
  return dayjs(date ? date : new Date()).format("YYYY-MM-DD");
};
