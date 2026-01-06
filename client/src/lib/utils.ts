import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(dateString: string): string {
  const target = parseLocalDate(dateString);
  if(!target) return "Sin fecha limite";

  const now = new Date();

  target.setHours(23, 59, 59, 999);
  
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 *24));

  if (!Number.isFinite(diffDays)) return "Sin fecha limite";
  if (diffDays < 0) return "Vencido";

  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

  if(diffDays < 7) return rtf.format(diffDays, "day");

  const diffWeeks = Math.round(diffDays / 7);
  if(diffWeeks < 4) return rtf.format(diffWeeks, "week");

  const diffMonths = Math.round(diffDays / 30);
  if (!Number.isFinite(diffMonths)) return "Sin fecha limite";

  return rtf.format(diffMonths, "month");
};

export function formatPrettyDate(dateString: string): string {
  const date = parseLocalDate(dateString);
  if (!date) return "Sin fecha";

  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
};

const parseLocalDate = (dateString: string) => {
  if (!dateString) return null;

  const parts = dateString.split("-");
  if (parts.length !== 3) return null;

  const [year, month, day] = parts.map(Number);
  
  if(!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}