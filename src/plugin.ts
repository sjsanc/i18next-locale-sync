import { stringify } from "csv-stringify";
import fs from "fs";
import { WebpackPluginInstance } from "webpack";
import { extractDotnestedKeys, mergeDeep, pruneKeys } from "./utilities";

const PLUGIN_NAME = "i18nextWebpackLocaleSyncPlugin";
const DEFAULT_LOCALE_FILEPATH = "public/locales";
const DEFAULT_TRANSLATION_FILENAME = "translation.json";
const DEFAULT_OUTDIR = "../..";
const DEFAULT_OUTFILE = "output";

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

  apply(compiler: any) {
    compiler.hooks.emit.tap(PLUGIN_NAME, (compilation: any) => {
      if (!fs.existsSync(DEFAULT_LOCALE_FILEPATH)) {
        console.error(`Unable to find a valid directory at ${DEFAULT_LOCALE_FILEPATH}`);
        return;
      } else {
        if (this.verbose) console.log("<<LOCALE_SYNC>> Starting translation sync...");
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
          const masterLocale = masterLocaleTranslation.data;
          this.translations.forEach((subLocale, subLocaleKey) => {
            if (subLocaleKey !== this.masterLocaleKey) {
              const mergedData = mergeDeep(subLocale.data, masterLocale);
              const prunedData = pruneKeys(mergedData, masterLocale);
              fs.writeFileSync(subLocale.path, JSON.stringify(prunedData));
              if (this.verbose) console.log(`<<LOCALE_SYNC>> ${subLocaleKey} updated`);
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
            fs.writeFile(DEFAULT_OUTFILE, out, (err) => {
              if (err) throw err;
              else {
                if (this.verbose) console.log(`<<LOCALE_SYNC>> Merged CSV generated`);
              }
            });
          });
        }
      }
    });
  }
}
