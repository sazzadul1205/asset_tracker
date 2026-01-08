// utils/formatCurrency.js

const CURRENCY_META = {
  USD: { locale: "en-US", symbol: "$" },
  EUR: { locale: "de-DE", symbol: "€" },
  GBP: { locale: "en-GB", symbol: "£" },
  BDT: { locale: "bn-BD", symbol: "৳" },
  INR: { locale: "en-IN", symbol: "₹" },
  JPY: { locale: "ja-JP", symbol: "¥" },
};

const formatCurrency = (
  value,
  {
    currency = "USD",
    locale,
    compact = false,
    showSymbol = true,
    decimals = 2,
  } = {}
) => {
  if (value === null || value === undefined) return "N/A";

  const num = Number(value);
  if (Number.isNaN(num)) return "N/A";

  const meta = CURRENCY_META[currency] || CURRENCY_META.USD;
  const usedLocale = locale || meta.locale;

  return new Intl.NumberFormat(usedLocale, {
    style: showSymbol ? "currency" : "decimal",
    currency,
    notation: compact ? "compact" : "standard",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export default formatCurrency;
