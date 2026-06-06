const MONEY_PATTERN = /^(0|[1-9][0-9]{0,17})(\.[0-9]{1,18})?$/;

export function assertMoneyString(value, fieldName = "amount") {
  if (typeof value !== "string") {
    throw new TypeError(`${fieldName} must be a decimal string, never a number`);
  }

  if (!MONEY_PATTERN.test(value)) {
    throw new TypeError(`${fieldName} must match NUMERIC(36,18) decimal-string rules`);
  }

  return value;
}

export function normalizeMoneyString(value, fieldName = "amount") {
  assertMoneyString(value, fieldName);
  const [whole, fractional = ""] = value.split(".");
  return `${whole}.${fractional.padEnd(18, "0")}`;
}
