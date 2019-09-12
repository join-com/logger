export const pick = (obj: any, keys: any[]) => {
  return keys
    .map(k => (k in obj ? { [k]: obj[k] } : {}))
    .reduce((acc, cur) => Object.assign(acc, cur), {});
};
