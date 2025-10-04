import { format } from "date-fns";

/**
 * Format a date to YYYY-MM-DD
 * @param date - The date to format (optional)
 * @default - The current date
 * @returns The formatted date
 */
export const gFormatDate = (date?: Date) => {
  return format(date ? date : new Date(), "yyyy-MM-dd");
};
