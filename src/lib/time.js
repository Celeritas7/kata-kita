export const localTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kuala_Lumpur';

export function greeting(hour = new Date().getHours()) {
  if (hour < 11) return ['Selamat pagi', 'Good morning'];
  if (hour < 15) return ['Selamat tengah hari', 'Good afternoon'];
  if (hour < 19) return ['Selamat petang', 'Good evening'];
  return ['Selamat malam', 'Good night'];
}

// Whole days since the epoch for the calendar date in `tz`. Same day boundary the streak uses on the server.
export function dayNumber(tz = localTz(), d = new Date()) {
  const [y, m, day] = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(d).split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, day) / 86400000);
}

export const dayIndex = (n, tz) => (n > 0 ? dayNumber(tz) % n : 0);
