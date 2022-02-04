const fs = require("fs");
const path = require("path");
const { stringify } = require("csv-stringify");

const args = process.argv;

const masterFilePath = args[2];
const masterFileData = JSON.parse(fs.readFileSync(masterFilePath, "utf-8"));

const subscriberFilePath = args[3];
const subscriberFileData = JSON.parse(fs.readFileSync(subscriberFilePath, "utf-8"));

// Recursive function to convert JSON to CSV
// extract(null, file) for initial use
const extract = (type, object, output = [], nestedKeys) => {
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

const masterFileMap = extract(null, masterFileData);
const subscriberFileMap = extract(null, subscriberFileData);

const isObject = (item) => {
  return item && typeof item === "object" && !Array.isArray(item);
};

const mergeDeep = (target, ...sources) => {
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

const syncJSON = (masterFileData, subscribers) => {
  subscribers.forEach((sub) => {
    const newSub = mergeDeep(sub, masterFileData);

    fs.writeFileSync(`${newSub[".LANG"]}-updated.json`, JSON.stringify(newSub), (err) => {
      if (err) throw err;
    });
  });
};

// Zips files
const zipMaps = (mapsArr) => {
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

const zippedData = zipMaps([masterFileMap, subscriberFileMap]);

// Turn converted JSON data into a suitable CSV with headers
const createCsv = (data) => {
  stringify(data, { header: true, columns: { key: "key", en: "en", es: "es" } }, (err, out) => {
    fs.writeFile("output.csv", out, (err) => {
      if (err) throw err;
    });
  });
};

syncJSON(masterFileData, [subscriberFileData]); // produces an updated JSON
createCsv(zippedData); // produces an updated CSV
