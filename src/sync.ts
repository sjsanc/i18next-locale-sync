const fs = require("fs");
const { stringify } = require("csv-stringify");

export const hello = () => {
  return "hello";
};

export const extractArgs = (args) => {
  let master = args[2];
  let subscribers = args.slice(3);
  let validFilepaths = [master, ...subscribers].map((p) => (p) => fs.existsSync(p)).every((e) => e);
  if (validFilepaths) {
    try {
      master = JSON.parse(fs.readFileSync(master, "utf-8"));
      subscribers = subscribers.map((s) => JSON.parse(fs.readFileSync(s, "utf-8")));
    } catch (e) {
      console.log(e);
    }
  }

  return { master, subscribers };
};

const { master, subscribers } = extractArgs(process.argv);

// Recursive function to convert JSON file into a CSV
// Nested keys are concatenated
export const extract = (
  type: "keys" | "values" | null,
  object: Record<string, any>,
  output: any = [],
  nestedKeys?: string
) => {
  for (const [k, val] of Object.entries(object)) {
    const key = nestedKeys ? nestedKeys + "." + k : k;
    if (typeof val === "string") {
      if (type === "keys") output.push(key);
      else if (type === "values") output.push(val);
      else output.push([key, val]);
    } else {
      extract(type, val, output, key);
    }
  }
  return new Map(output);
};

const isObject = (item) => {
  return item && typeof item === "object" && !Array.isArray(item);
};

export const mergeDeep = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: "" });
        mergeDeep(target[key], source[key]);
      } else {
        if (!target[key]) Object.assign(target, { [key]: "" });
      }
    }
  }
  return mergeDeep(target, ...sources);
};

// Takes a master JSON and n subscribers and produces a <filename>-updated.json with the new keys from master
const updateSubscriberJson = (master: object, subscribers: object[]) => {
  subscribers.forEach((sub) => {
    const newSub = mergeDeep(sub, master);
    fs.writeFileSync(`${newSub[".LANG"]}-updated.json`, JSON.stringify(newSub), (err) => {
      if (err) throw err;
    });
  });
};

// Zips the JSON files by concatenating their values into a new column
export const zipMaps = (mapsArr: Map<any, any>[]) => {
  const zipped = new Map();
  mapsArr.forEach((map) => {
    const lang = map.get(".LANG");
    for (const [key, value] of map.entries()) {
      if (key !== ".LANG") {
        if (zipped.get(key)) {
          const merged = { ...zipped.get(key), ...{ [lang]: value } };
          zipped.set(key, merged);
        } else {
          zipped.set(key, { [lang]: value });
        }
      }
    }
  });
  return Array.from(zipped, ([key, value]) => ({ ...{ key }, ...value }));
};

// Turn converted JSON data into a suitable CSV with headers
const createCsv = (data) => {
  stringify(data, { header: true, columns: { key: "key", en: "en", es: "es" } }, (err, out) => {
    fs.writeFile("output.csv", out, (err) => {
      if (err) throw err;
    });
  });
};

const masterMap = extract(null, master);
const subscriberMaps = subscribers.map((s) => extract(null, s));
const zippedData = zipMaps([masterMap, ...subscriberMaps]);

updateSubscriberJson(master, subscribers); // produces an updated JSON
createCsv(zippedData); // produces an updated CSV
