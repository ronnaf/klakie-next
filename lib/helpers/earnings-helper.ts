import { convertSecondsToHours } from "./duration-helper";

export const DEFAULT_TAX_DEDUCTION_PERCENT = 0.02;

export const calculateEarnings = (
  hours: number,
  hourlyRate: number,
  taxDeductionPercent: number = DEFAULT_TAX_DEDUCTION_PERCENT
) => {
  const earnings = hours * hourlyRate;
  const taxWithheld = earnings * taxDeductionPercent;
  return {
    earnings,
    taxWithheld,
    totalEarnings: earnings - taxWithheld,
  };
};
