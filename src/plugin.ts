import { stringify } from "csv-stringify";
import fs from "fs";
import { WebpackPluginInstance } from "webpack";
import { extractDotnestedKeys, mergeDeep, pruneKeys } from "./utilities";

const PLUGIN_NAME = "i18nextWebpackLocaleSyncPlugin";
const DEFAULT_LOCALE_FILEPATH = "public/locales";
const DEFAULT_TRANSLATION_FILENAME = "translation.json";
const DEFAULT_OUTDIR = "../..";
const DEFAULT_OUTFILE = "output";
const PLUGIN_PREFIX_COLOR = "\x1b[36m%s\x1b[0m";
const PLUGIN_PREFIX = "[[i18NEXT-LOCALE-SYNC]]";

interface i18nextLocaleSyncPluginOptions {
  masterLocale: string;
  produceCSV?: boolean;
  outDir?: string;
  outFile?: string;
  verbose?: boolean;
}

export class Plugin implements WebpackPluginInstance {
  private translations: Map<string, { path: string; data: Record<string, any> }> = new Map();
  private masterLocaleKey: string;
  private produceCSV: boolean;
  private outDir: string;
  private outFile: string;
  private verbose: boolean;

  constructor(props: i18nextLocaleSyncPluginOptions) {
    this.masterLocaleKey = props.masterLocale;
    this.produceCSV = props.produceCSV || false;
    this.outDir = props.outDir || DEFAULT_OUTDIR;
    this.outFile = props.outFile || DEFAULT_OUTFILE;
    this.verbose = props.verbose || false;
  }

  log(text: string) {
    if (this.verbose) console.log(PLUGIN_PREFIX_COLOR, `${PLUGIN_PREFIX}: ${text}`);
  }

  apply(compiler: any) {
    compiler.hooks.emit.tap(PLUGIN_NAME, (compilation: any) => {
      if (!fs.existsSync(DEFAULT_LOCALE_FILEPATH)) {
        console.error(`Unable to find a valid directory at ${DEFAULT_LOCALE_FILEPATH}`);
        return;
      } else {
        this.log("Starting translation sync");
        process.chdir(DEFAULT_LOCALE_FILEPATH);
        const cwd = process.cwd();

        // Parse the JSON for each locale into memory
        fs.readdirSync(cwd).forEach((locale) => {
          const path = `${cwd}/${locale}/${DEFAULT_TRANSLATION_FILENAME}`;
          if (fs.existsSync(path)) {
            this.translations.set(locale, {
              path,
              data: JSON.parse(fs.readFileSync(path, "utf-8")),
            });
          }
        });

        // Merge and prune the subordinate locales against the master and write to file
        const masterLocaleTranslation = this.translations.get(this.masterLocaleKey);
        if (masterLocaleTranslation) {
          const masterLocaleData = masterLocaleTranslation.data;
          this.translations.forEach((subLocale, subLocaleKey) => {
            if (subLocaleKey !== this.masterLocaleKey) {
              const mergedData = mergeDeep(subLocale.data, masterLocaleData);
              const prunedData = pruneKeys(mergedData, masterLocaleData);
              fs.writeFileSync(subLocale.path, JSON.stringify(prunedData));
              this.log(`${subLocaleKey} updated`);
            }
          });
        }

        // Produce a CSV of the merged locales and their shared dotnested keys
        if (this.produceCSV) {
          const zipMap = new Map();
          const columns = { key: "key" };

          this.translations.forEach((locale, localeKey) => {
            const dotnestedEntries = extractDotnestedKeys(null, locale.data);
            columns[localeKey] = localeKey;
            for (const [key, val] of dotnestedEntries.entries()) {
              if (zipMap.get(key)) {
                zipMap.set(key, { ...zipMap.get(key), ...{ [localeKey]: val } });
              } else {
                zipMap.set(key, { [localeKey]: val });
              }
            }
          });

          // Write the CSV to default output location
          const csvLikeArray = Array.from(zipMap, ([k, v]) => ({ ...{ k }, ...v }));
          process.chdir(this.outDir);

          stringify(csvLikeArray, { header: true, columns }, (err, out) => {
            fs.writeFile(`${this.outFile}.csv`, out, (err) => {
              if (err) throw err;
              else this.log("Merged CSV produced");
            });
          });
        }

        this.log("Sync completed");
      }
    });
  }
}
