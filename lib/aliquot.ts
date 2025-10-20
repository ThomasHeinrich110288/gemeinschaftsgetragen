import type { AliquotPreview, PledgeSeed } from "./types";

interface ExpandedPledge {
  maxAmount: number;
}

const toCents = (value: number) => Math.round(value * 100);

export function buildAliquotPreview(
  need: number | null,
  pledgeSeeds: PledgeSeed[]
): AliquotPreview {
  const expanded: ExpandedPledge[] = pledgeSeeds.flatMap((pledge) =>
    Array.from({ length: pledge.count }, () => ({ maxAmount: pledge.maxAmount }))
  );

  if (!need || need <= 0 || expanded.length === 0) {
    return {
      factor: 0,
      sumMax: expanded.reduce((acc, pledge) => acc + pledge.maxAmount, 0),
      totalAssigned: 0,
      chargeGroups: []
    };
  }

  const maxCentsArray = expanded.map((pledge) => toCents(pledge.maxAmount));
  const sumMaxCents = maxCentsArray.reduce((acc, value) => acc + value, 0);

  if (sumMaxCents === 0) {
    return {
      factor: 0,
      sumMax: 0,
      totalAssigned: 0,
      chargeGroups: []
    };
  }

  const needCents = toCents(need);
  const targetCents = Math.min(needCents, sumMaxCents);
  const factor = targetCents / sumMaxCents;

  const rawCents = maxCentsArray.map((value) => value * factor);
  const baseCents = rawCents.map((value) => Math.floor(value));
  const assignedBase = baseCents.reduce((acc, value) => acc + value, 0);
  let remainder = targetCents - assignedBase;

  const fractionalOrder = rawCents
    .map((value, index) => ({
      index,
      fractional: value - Math.floor(value)
    }))
    .sort((a, b) => b.fractional - a.fractional);

  const adjusted = [...baseCents];
  let cursor = 0;
  while (remainder > 0 && fractionalOrder.length > 0) {
    const { index } = fractionalOrder[cursor % fractionalOrder.length];
    adjusted[index] += 1;
    cursor += 1;
    remainder -= 1;
  }

  const chargeGroupsMap = new Map<number, number>();
  adjusted.forEach((value) => {
    const amount = value / 100;
    const current = chargeGroupsMap.get(amount) ?? 0;
    chargeGroupsMap.set(amount, current + 1);
  });

  const chargeGroups = Array.from(chargeGroupsMap.entries())
    .map(([amount, count]) => ({ amount, count }))
    .sort((a, b) => b.amount - a.amount);

  return {
    factor,
    sumMax: sumMaxCents / 100,
    totalAssigned: adjusted.reduce((acc, value) => acc + value, 0) / 100,
    chargeGroups
  };
}
