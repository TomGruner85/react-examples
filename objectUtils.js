export const toString = (obj) => {
  if (obj) {
    return Object.entries(obj)
      .map(([key, value]) => `${key}=${value}`)
      .join(",");
  }
  return null;
};

export const parseString = (str) => {
  if (str) {
    const obj = {};
    const pairs = str.split(",");
    pairs.forEach((pair) => {
      const [k, v] = pair.split("=");
      obj[k] = v;
    });
    return obj;
  }
  return null;
};
