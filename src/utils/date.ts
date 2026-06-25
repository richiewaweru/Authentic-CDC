const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
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

function parseSlotDate(date: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(date);
}

export function formatSlotTime(time: string) {
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }

  const [hoursText = '0', minutesText = '00'] = time.slice(0, 5).split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export const formatDateLabel = (date: string) => weekdayFormatter.format(parseSlotDate(date));

export const formatSlotDate = (date: string) => longDateFormatter.format(parseSlotDate(date));

export const formatSlotDateLong = formatSlotDate;

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
