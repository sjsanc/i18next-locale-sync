import { Compilation, Compiler, Stats } from "webpack";
import fs from "fs";

export default class i18nextLocaleSyncPlugin {
  public test: string;
  public masterLocale: string;
  public translations: Map<string, { path: string; data: any }> = new Map();

  constructor(props: any) {
    this.masterLocale = props.masterLocale;
  }

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

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap("i18nextLocaleSyncPlugin", (compilation: Compilation) => {
      process.chdir("public/locales");
      const cwd = process.cwd();

      fs.readdirSync(cwd).forEach((l) => {
        this.translations.set(l, {
          path: `${cwd}/${l}/translation.json`,
          data: JSON.parse(fs.readFileSync(`${cwd}/${l}/translation.json`, "utf-8")),
        });
      });

      if (this.masterLocale) {
        const masterData = this.translations.get(this.masterLocale).data;
        this.translations.forEach((v, k) => {
          if (k !== this.masterLocale) {
            const updated = this.mergeDeep(v.data, masterData);
            fs.writeFileSync(v.path, JSON.stringify(updated));
          }
        });
      }
    });
  }
}
