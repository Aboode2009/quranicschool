import { ar } from "date-fns/locale";
import type { Locale } from "date-fns";

const syriacMonths = [
  "كانون الثاني",
  "شباط",
  "آذار",
  "نيسان",
  "أيار",
  "حزيران",
  "تموز",
  "آب",
  "أيلول",
  "تشرين الأول",
  "تشرين الثاني",
  "كانون الأول",
];

export const syriacLocale: Locale = {
  ...ar,
  localize: {
    ...ar.localize,
    month: (n: number) => syriacMonths[n],
  },
} as Locale;

export function formatSyriacDate(date: Date): string {
  const day = date.getDate();
  const month = syriacMonths[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}
