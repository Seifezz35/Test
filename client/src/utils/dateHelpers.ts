export const arabicDateFormatter = new Intl.DateTimeFormat("ar-EG", {
  dateStyle: "full"
});

export const currencyFormatter = new Intl.NumberFormat("ar-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0
});

export const numberFormatter = new Intl.NumberFormat("ar-EG", {
  maximumFractionDigits: 1
});

export const formatArabicDate = (value: string | Date) =>
  arabicDateFormatter.format(typeof value === "string" ? new Date(value) : value);

export const formatCurrency = (value: number, currency = "EGP") =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);

export const formatCompactNumber = (value: number) => numberFormatter.format(value);

export const getTodayIso = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatMonthLabel = (value: string) =>
  new Intl.DateTimeFormat("ar-EG", {
    month: "long",
    year: "numeric"
  }).format(new Date(`${value}-01T00:00:00`));

export const formatShortDay = (value: string) =>
  new Intl.DateTimeFormat("ar-EG", {
    weekday: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00`));
