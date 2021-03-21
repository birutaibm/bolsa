export function isValidISODate(date: string) {
  const isoFormat = '^\\d{4}-\\d{2}-\\d{2}' +    // Match YYYY-MM-DD
                '((T\\d{2}:\\d{2}(:\\d{2})?)' +  // Match THH:mm:ss
                '(\\.\\d{1,6})?' +               // Match .sssss
                '(Z|(\\+|-)\\d{2}:\\d{2})?)?$';  // Time zone (Z or +hh:mm)
  const matcher = new RegExp(isoFormat);
  return matcher.test(date) && !Number.isNaN(Date.parse(date));
}

export function notNull<T>(param: T | null): T {
  if (param === null) {
    throw new Error("Unexpected null value");
  }
  return param;
}

export function isNumber(param: string): boolean {
  return !Number.isNaN(Number(param));
}
