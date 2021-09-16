export const formatDecimalTimeToDuration = (
  decimal: number,
  type: 'hours' | 'minutes' | 'seconds' | 'milliseconds',
  format: ':::' | 'hr m s' = ':::'
) => {
  let decimalInSeconds = 0;
  switch (type) {
    case 'hours':
      decimalInSeconds = decimal * 3600;
      break;
    case 'minutes':
      decimalInSeconds = decimal * 60;
      break;
    case 'seconds':
      decimalInSeconds = decimal;
      break;
    case 'milliseconds':
      decimalInSeconds = decimal / 1e6;
      break;
    default:
      break;
  }

  const exactHours = decimalInSeconds / 3600;
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
