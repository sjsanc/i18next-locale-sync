# i18next-webpack-locale-sync

Syncs i18next translations files against a master locale.

## Install

```console
yarn add 18next-webpacl-locale-sync --dev
```

**webpack.config.js**

```js
import i18nextWebpackLocaleSync from "i18next-webpack-locale-sync"

new i18nextWebpackLocaleSync({ masterLocale: 'en' }),
```

The plugin expects your translation files to be in `/public/locales`

## Generating a CSV

A CSV with the combined translations for all your locales can be generated, organised with their object paths as dotnested strings. This is useful for comparisons, or if your translators prefer spreadsheets.

```console
common.hello,hello,hola,hallo
```

Missing entries will be skipped

```console
validation.invalid.chars,not enough cowbell,,Nicht genug Kuhglocke
```

## Options

```js
interface PluginOptions {
  masterLocale: string; // The locale against which all others are compared
  produceCSV?: boolean; // Generates a CSV of all the translation keys. Default false
  csvOutDir?: string; // The CSV output filepath. Default is the root folder
  csvOutFile?: string; // The CSV filename. Default is output.csv
  verbose?: boolean; // Outputs information during the compilation phase
}
```
