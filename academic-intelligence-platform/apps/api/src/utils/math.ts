export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function weightedAverage(values: Array<{ value: number; weight: number }>): number {
  if (!values.length) return 0;
  const totalWeight = values.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = values.reduce((sum, item) => sum + item.value * item.weight, 0);
  return weightedSum / totalWeight;
}
