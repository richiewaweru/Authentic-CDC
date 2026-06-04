const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

export const timeTo24Hour = (time: string) => {
  const [clock, meridiem] = time.split(' ');
  const [hoursText, minutesText] = clock.split(':');
  let hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (meridiem === 'PM' && hours !== 12) {
    hours += 12;
  }

  if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
};

export const addMinutesToTime = (time: string, minutesToAdd: number) => {
  const { hours, minutes } = timeTo24Hour(time);
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const nextHours24 = Math.floor(totalMinutes / 60) % 24;
  const nextMinutes = totalMinutes % 60;
  const meridiem = nextHours24 >= 12 ? 'PM' : 'AM';
  const hours12 = nextHours24 % 12 === 0 ? 12 : nextHours24 % 12;
  const paddedMinutes = String(nextMinutes).padStart(2, '0');

  return `${hours12}:${paddedMinutes} ${meridiem}`;
};

export const formatDateLabel = (date: string) => weekdayFormatter.format(new Date(date));

export const getNextWeekdays = (count: number) => {
  const dates: string[] = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);

  while (dates.length < count) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(cursor.toISOString());
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
};
