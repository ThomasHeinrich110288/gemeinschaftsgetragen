export const euroFormatter = new Intl.NumberFormat("de-AT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2
});

export function formatCurrency(amount: number, currency = "EUR"): string {
  const formatter = currency === "EUR" ? euroFormatter : new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2
  });
  return formatter.format(amount);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)} %`;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat("de-AT", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}
