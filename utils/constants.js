const USER_ROLE = {
  ADMIN: "ADMIN",
  CORPORATE: "CORPORATE",
  EMPLOYEE: "EMPLOYEE",
};
const CUR_ALIAS = {
  "$": "USD",
  "¥": "CNY",
  "₹": "INR",
  "€": "EUR",
};

const DEFAULT_RATES = {
  "USD": 1,
  "CNY": 6.44,
  "INR": 73.25,
  "EUR": 0.82,
};

module.exports = {
  USER_ROLE,
  CUR_ALIAS,
  DEFAULT_RATES,
};
