// Преобразует "HH:mm" → Date (сегодня или завтра)
function parseTimeToToday(timeStr: string, tomorrow = false): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  if (tomorrow) {
    date.setDate(date.getDate() + 1);
  }
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Форматирует разницу в читаемый вид: "1 ч 30 мин"
function formatDuration(ms: number): [number, number] {
  const totalMinutes = Math.floor(ms / (1000 * 60));
  if (totalMinutes <= 0) return [0, 0];

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return [hours, minutes]
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);

  // Получаем компоненты даты
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() возвращает 0–11
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function getNextScanInfo(
  shiftStart: string,
  lunchStart: string,
  lunchEnd: string,
  shiftEnd: string
): { nextEvent: string; timeUntil: [number, number] } {
  const now = new Date();

  const todayShiftStart = parseTimeToToday(shiftStart);
  const todayLunchStart = parseTimeToToday(lunchStart);
  const todayLunchEnd = parseTimeToToday(lunchEnd);
  const todayShiftEnd = parseTimeToToday(shiftEnd);

  let nextTime: Date;
  let eventLabel: string;

  if (now < todayShiftStart) {
    // До начала смены
    nextTime = todayShiftStart;
    eventLabel = 'начало смены';
  } else if (now < todayLunchStart) {
    // От начала смены до обеда
    nextTime = todayLunchStart;
    eventLabel = 'начало обеда';
  } else if (now < todayLunchEnd) {
    // Обед
    nextTime = todayLunchEnd;
    eventLabel = 'окончание обеда';
  } else if (now < todayShiftEnd) {
    // После обеда до конца смены
    nextTime = todayShiftEnd;
    eventLabel = 'окончание смены';
  } else {
    // После окончания смены — завтрашнее начало
    nextTime = parseTimeToToday(shiftStart, true);
    eventLabel = 'начало завтрашней смены';
  }

  const diffMs = nextTime.getTime() - now.getTime();
  const duration = formatDuration(diffMs);

  return {
    nextEvent: eventLabel,
    timeUntil: duration,
  };
}