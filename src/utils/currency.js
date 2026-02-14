export const CURRENCY = "S$";

export const money = (n) => {
return Number(n || 0).toFixed(2);
};

export const formatMoney = (n) => {
  return `${CURRENCY}${money(n)}`;
};
