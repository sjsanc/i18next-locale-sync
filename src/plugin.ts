const { Compilation, Compiler } = require("webpack");
const fs = require("fs");
const { stringify } = require("csv-stringify");

interface i18nextLocaleSyncPluginOptions {
  masterLocale: string;
  produceCSV?: boolean;
}

class i18nextLocaleSyncPlugin {
  public masterLocale: string;
  public produceCSV?: boolean = false;
  public CSVoutput: any;
  public translations: Map<string, { path: string; data: any }> = new Map();

  constructor(props: i18nextLocaleSyncPluginOptions) {
    this.masterLocale = props.masterLocale;
    this.produceCSV = props.produceCSV;
  }

  // Rescursively extracts the dotnested path for each JSON key
  extract(
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
      } else this.extract(type, val, output, key);
    }
    return new Map(output);
  }

  isObject(item: any) {
    return item && typeof item === "object" && !Array.isArray(item);
  }

  diff(target: any, ...sources: any): any {
    if (!sources.length) return target;
    const source = sources.shift();
    if (this.isObject(target) && this.isObject(source)) {
      for (const key in target) {
        if (!source[key]) delete target[key];
      }
    }
    return this.diff(target, ...sources);
  }

  mergeDeep(target: any, ...sources: any): any {
    if (!sources.length) return target;
    const source = sources.shift();
    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: "" });
          this.mergeDeep(target[key], source[key]);
        } else {
          if (!target[key]) Object.assign(target, { [key]: "" });
        }
      }
    }
    return this.mergeDeep(target, ...sources);
  }

  zipMaps(mapsArr: Map<any, any>[]) {
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
  }

  apply(compiler: any) {
    compiler.hooks.emit.tap("i18nextLocaleSyncPlugin", (compilation: any) => {
      if (!fs.existsSync("public/locales")) {
        console.error("Unable to find an entry direction at 'public/locales'");
        return;
      }

      process.chdir("public/locales");
      const cwd = process.cwd();

      fs.readdirSync(cwd).forEach((l) => {
        const path = `${cwd}/${l}/translation.json`;
        if (fs.existsSync(path))
          this.translations.set(l, {
            path: path,
            data: JSON.parse(fs.readFileSync(path, "utf-8")),
          });
      });

      if (this.masterLocale) {
        const masterData = this.translations.get(this.masterLocale)!.data;
        this.translations.forEach((v, k) => {
          if (k !== this.masterLocale) {
            const updated = this.diff(this.mergeDeep(v.data, masterData), masterData);
            fs.writeFileSync(v.path, JSON.stringify(updated));
          }
        });
      }

      if (this.produceCSV) {
        const zip = new Map();
        const columns: any = { key: "key" };
        this.translations.forEach((v, lang) => {
          const data = this.extract(null, v.data);
          columns[lang] = lang;
          for (const [key, val] of data.entries()) {
            if (zip.get(key)) {
              zip.set(key, { ...zip.get(key), ...{ [lang]: val } });
            } else {
              zip.set(key, { [lang]: val });
            }
          }
        });

        const prepped = Array.from(zip, ([key, val]) => ({ ...{ key }, ...val }));
        process.chdir("../..");

        stringify(prepped, { header: true, columns }, (err, out) => {
          fs.writeFile("output.csv", out, (err) => {
            if (err) throw err;
          });
        });
      }
    });
  }
}

module.exports = i18nextLocaleSyncPlugin;
