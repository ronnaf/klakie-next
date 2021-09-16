export interface ClockifyDetailedReport {
  totals: Total[] | [null];
  timeentries: TimeEntry[];
}

export interface Total {
  _id: string;
  totalTime: number;
  entriesCount: number;
  totalAmount: any;
}

export interface TimeEntry {
  _id: string;
  description: string;
  userId: string;
  billable: boolean;
  taskId: any;
  projectId: string;
  timeInterval: TimeInterval;
  approvalRequestId: any;
  tags: any[];
  isLocked: boolean;
  customFields: any;
  userName: string;
  userEmail: string;
  projectName: string;
  projectColor: string;
  clientName: string;
  clientId: string;
}

export interface TimeInterval {
  start: string;
  end: string;
  duration: number;
}
