export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatCurrency(amount: number | null) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function getBookingYearMonth(bookingDate: string): { year: number; month: number } {
  const d = new Date(bookingDate);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function isMonthDisabled(year: number, month: number, bookingDate: string): boolean {
  const d = new Date(bookingDate);
  const bookYear = d.getFullYear();
  const bookMonth = d.getMonth() + 1;
  return year < bookYear || (year === bookYear && month < bookMonth);
}

export function getYearsRange(bookingDate: string): number[] {
  const startYear = new Date(bookingDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = startYear; y <= currentYear + 1; y++) years.push(y);
  return years;
}
