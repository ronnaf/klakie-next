import { TimeEntry } from './clockify-detailed-report';

export type GroupEntry = {
  id: string;
  description: string;
  totalDescHours: number;
  timeEntries: TimeEntry[];
};
