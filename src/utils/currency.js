export const CURRENCY = "S$";

export const money = (n) => {
  return Math.round(Number(n || 0));
};

export const formatMoney = (n) => {
  return `${CURRENCY}${money(n)}`;
};
