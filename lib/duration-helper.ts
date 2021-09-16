export const formatSecondsToDuration = (seconds: number) => {
  const exactHours = seconds / 3600;
  const flooredHours = Math.floor(exactHours);

  const exactMinutes = (exactHours - flooredHours) * 60;
  const flooredMinutes = Math.floor(exactMinutes);

  const exactSeconds = (exactMinutes - flooredMinutes) * 60;
  const flooredSeconds = Math.floor(exactSeconds);

  const hourStr = flooredHours.toString().padStart(2, '0');
  const minuteStr = flooredMinutes.toString().padStart(2, '0');
  const secondStr = flooredSeconds.toString().padStart(2, '0');

  return `${hourStr}:${minuteStr}:${secondStr}`;
};

export const convertSecondsToHours = (seconds: number) => {
  return seconds / 3600;
};
