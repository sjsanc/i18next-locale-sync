/**
 * Transforms multiple JSON documents into a single Map, using dotnested keys as Map keys
 * Lifted from https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
 * @param type either "keys", "values" or null for the initial pass
 * @param object the locale translation data
 * @param output a Map containing the dotnested keys
 * @param nestedKeys top-level key for the next recurse
 * @returns
 */
export function extractDotnestedKeys(
  type: "keys" | "values" | null,
  object: Record<string, any>,
  output: any = [],
  nestedKeys?: string
) {
  for (const [k, val] of Object.entries(object)) {
    const key = nestedKeys ? nestedKeys + "." + k : k;
    if (typeof val === "string") {
      if (type === "keys") output.push(key);
      else if (type === "values") output.push(val);
      else output.push([key, val]);
    } else extractDotnestedKeys(type, val, output, key);
  }
  console.log(new Map(output));
  return new Map(output);
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * Lifted from https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
 * @param target
 * @param ...sources
 */
export function mergeDeep(target: Record<string, any>, ...sources: Record<string, any>[]) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: "" });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

/**
 * Prune any keys that don't appear in the master locale
 * @param target
 * @param ...sources
 */
export const pruneKeys = (target: any, ...sources: any) => {
  if (!sources.length) return target;
  const source = sources.shift();
  if (isObject(target) && isObject(source)) {
    for (const key in target) {
      if (!source[key]) delete target[key];
    }
  }
  return pruneKeys(target, ...sources);
};
