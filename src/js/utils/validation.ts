import { isValidISODate } from "./dates";

export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isIntegerString(value: unknown): value is string {
    return typeof value === "string" && /^[0-9]+$/.test(value);
}

/** Returns true if value is a valid time string with the format hh:mm */
export function isTimeString(value: unknown): value is string {
    if (typeof value !== "string") {
        return false;
    }
    const parts = value.split(":");
    return (
        parts.length === 2 &&
        parts.every(isIntegerString) &&
        Number(parts[0]) < 24 &&
        Number(parts[1]) < 60
    );
}

export function getString(value: unknown, fallback: string): string {
    return typeof value === "string" ? value : fallback;
}

export function getISODate(value: unknown, fallback: string): string {
    return typeof value === "string" && isValidISODate(value)
        ? value
        : fallback;
}

export function getTimeString(value: unknown, fallback: string): string {
    return isTimeString(value) ? value : fallback;
}

export function getArrayMember<T>(
    array: readonly T[],
    value: unknown,
    fallback: T
): T {
    return array.includes(value as T) ? (value as T) : fallback;
}
