import { convertSecondsToHours } from './duration-helper';

export const DEFAULT_TAX_DEDUCTION_PERCENT = 0.02;

export const calculateEarnings = (
  seconds: number,
  hourlyRate: number,
  taxDeductionPercent: number = DEFAULT_TAX_DEDUCTION_PERCENT
) => {
  const hoursWorked = convertSecondsToHours(seconds);
  const earnings = hoursWorked * hourlyRate;
  const taxWithheld = earnings * taxDeductionPercent;
  return {
    taxWithheld,
    totalEarnings: earnings - taxWithheld,
  };
};
