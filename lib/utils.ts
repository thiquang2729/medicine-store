import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function serializePrisma<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "object" &&
      value !== null &&
      value.constructor?.name === "Decimal"
        ? Number(value)
        : value
    )
  );
}

