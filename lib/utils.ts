import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | undefined) {
  if (!date) return "";
  // Aseguramos que la fecha se interprete en UTC para evitar desfases de zona horaria
  const dateObj = new Date(date);
  const year = dateObj.getUTCFullYear();
  const month = dateObj.getUTCMonth() + 1;
  const day = dateObj.getUTCDate();
  // Formateamos con dos dígitos para día y mes
  const dayStr = day.toString().padStart(2, "0");
  const monthStr = month.toString().padStart(2, "0");
  return `${dayStr}/${monthStr}/${year}`;
}
