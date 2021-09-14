export interface ClockifyWorkspace {
  id: string;
  name: string;
  hourlyRate: HourlyRate;
  memberships: Membership[];
  workspaceSettings: WorkspaceSettings;
  imageUrl: string;
  featureSubscriptionType?: string;
}

export interface HourlyRate {
  amount: number;
  currency: string;
}

export interface Membership {
  userId: string;
  hourlyRate: any;
  costRate: any;
  targetId: string;
  membershipType: string;
  membershipStatus: string;
}

export interface WorkspaceSettings {
  timeRoundingInReports: boolean;
  onlyAdminsSeeBillableRates: boolean;
  onlyAdminsCreateProject: boolean;
  onlyAdminsSeeDashboard: boolean;
  defaultBillableProjects: boolean;
  lockTimeEntries?: string;
  round: Round;
  projectFavorites: boolean;
  canSeeTimeSheet: boolean;
  canSeeTracker: boolean;
  projectPickerSpecialFilter: boolean;
  forceProjects: boolean;
  forceTasks: boolean;
  forceTags: boolean;
  forceDescription: boolean;
  onlyAdminsSeeAllTimeEntries: boolean;
  onlyAdminsSeePublicProjectsEntries: boolean;
  trackTimeDownToSecond: boolean;
  projectGroupingLabel: string;
  adminOnlyPages: any[];
  automaticLock: any;
  onlyAdminsCreateTag: boolean;
  onlyAdminsCreateTask: boolean;
  timeTrackingMode: string;
  isProjectPublicByDefault: boolean;
}

export interface Round {
  round: string;
  minutes: string;
}
