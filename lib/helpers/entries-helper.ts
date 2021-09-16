import dayjs from 'dayjs';
import { TimeEntry } from '../models/clockify-detailed-report';
import { DailyEntry } from '../models/daily-entry';
import { GroupEntry } from '../models/group-entry';

export const getTotalHoursOfTimeEntries = (timeEntries: TimeEntry[]) => {
  return timeEntries.reduce((acc, cur) => {
    if (cur.timeInterval.end) {
      const start = dayjs(cur.timeInterval.start);
      const end = dayjs(cur.timeInterval.end);
      const duration = end.diff(start, 'hour', true);
      return acc + duration;
    }
    return acc;
  }, 0);
};

/**
 * Generates time entries by day.
 * Calculates total hours of each description, and calculates total hours of each day.
 */
export const getDailyTimeEntries = (timeEntries: TimeEntry[]) => {
  // { [date]: {...timeEntry} }
  const timeEntriesByDateLib: { [key: string]: TimeEntry[] } = {};
  timeEntries.forEach((entry) => {
    const dateStartedYear = dayjs(entry.timeInterval.start).year();
    const dateStartedMonth = dayjs(entry.timeInterval.start).month();
    const dateStartedDate = dayjs(entry.timeInterval.start).date();

    // [dateStarted] is a key
    const dateStarted = dayjs([
      dateStartedYear,
      dateStartedMonth,
      dateStartedDate,
    ]).toJSON();

    // initialize timeEntriesByDateLib[dateStarted]
    if (!timeEntriesByDateLib[dateStarted]) {
      timeEntriesByDateLib[dateStarted] = [];
    }
    timeEntriesByDateLib[dateStarted].push(entry);
  });

  // [{ dateStarted: 'dddd - MMM, DD', timeEntry, totalDayHours }]
  const entriesByDay: DailyEntry[] = Object.entries(timeEntriesByDateLib).map(
    ([dateStarted, timeEntries]) => {
      // calculate total hours of the day
      const totalDayHours = getTotalHoursOfTimeEntries(timeEntries);

      // { [desc]: {...timeEntry} }
      const timeEntriesByDescLib: { [key: string]: TimeEntry[] } = {};
      timeEntries.forEach((entry) => {
        const desc = entry.description;
        // initialize timeEntriesByDescLib[desc]
        if (!timeEntriesByDescLib[desc]) {
          timeEntriesByDescLib[desc] = [];
        }
        timeEntriesByDescLib[desc].push(entry);
      });

      // [{ desc, timeEntries, totalDescHours }]
      const groupedTimeEntries: GroupEntry[] = Object.entries(
        timeEntriesByDescLib
      ).map(([desc, timeEntries], idx) => {
        // calculate total hours of the same description
        const totalDescHours = getTotalHoursOfTimeEntries(timeEntries);
        const id = `${desc}_${idx}`;
        return {
          id,
          description: desc,
          timeEntries,
          totalDescHours,
        };
      });

      return {
        dateStarted,
        timeEntries,
        totalDayHours,
        groupedTimeEntries,
      };
    }
  );

  return entriesByDay;
};
