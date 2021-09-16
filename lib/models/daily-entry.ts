import { TimeEntry } from './clockify-detailed-report';
import { GroupEntry } from './group-entry';

export type DailyEntry = {
  dateStarted: string;
  totalDayHours: number;
  timeEntries: TimeEntry[];
  groupedTimeEntries: GroupEntry[];
};
