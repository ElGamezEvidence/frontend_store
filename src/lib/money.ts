export function toNumber(value: number | string | null | undefined | { toNumber?: () => number }): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && typeof value.toNumber === "function") return value.toNumber();
  return Number(value);
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
