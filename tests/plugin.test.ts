import { TempSandbox } from "temp-sandbox";
import { Compiler, Configuration, Stats } from "webpack";
import { Plugin } from "../src/plugin";

type TestConfiguration = Omit<Configuration, "mode"> & {
  mode?: Configuration["mode"] | null;
};

type TestCompiler = Omit<Compiler, "run"> & {
  run: () => Promise<unknown>;
};

const webpack = (options: TestConfiguration = {}): TestCompiler => {
  const webpackActual = require("webpack");
  const compiler = webpackActual(options);
  const runAsync = () =>
    new Promise((resolve, reject) => {
      compiler.run((error: Error, stats: Stats) => {
        if (error || stats.hasErrors()) {
          reject(error);
          return;
        }
        resolve(stats);
      });
    });

  return { ...compiler, run: runAsync };
};

const sandbox = new TempSandbox({ randomDir: true });

const ENTRY_FILE = "src/index.js";
const ENTRY_FILE_FULL = sandbox.path.resolve(ENTRY_FILE);
const OUTPUT_PATH = "dist";
const OUTPUT_PATH_FULL = sandbox.path.resolve(OUTPUT_PATH);
const LANG_ONE_PATH = "public/locales/en/translation.json";
const LANG_TWO_PATH = "public/locales/es/translation.json";
const CSV_OUTPUT_PATH = "output.csv";

let consoleSpy: any;
const cwd = process.cwd();

const testTranslations = {
  langOne: {
    test: "test",
    keyFromMaster: "this should be empty",
    nested: { nestedChild: "", ".specialKey": "" },
  },
  langTwo: {
    test: "test",
    nested: { nestedChild: "", ".specialKey": "" },
    discardedKey: "this should be discarded",
  },
  langTwoMerged: {
    test: "test",
    keyFromMaster: "",
    nested: { nestedChild: "", ".specialKey": "" },
  },
};

const mergedCsv = `key,en,es
test,test,test
keyFromMaster,this should be empty,
nested.nestedChild,,
nested..specialKey,,`;

const createSourceFolder = () => {
  sandbox.createFileSync(ENTRY_FILE);
  sandbox.createFileSync(LANG_ONE_PATH, testTranslations.langOne);
  sandbox.createFileSync(LANG_TWO_PATH, testTranslations.langTwo);
  sandbox.createDirSync("public/locales/.DS_Store/");
};

const getCompiler = (plugin: Plugin) =>
  webpack({
    entry: ENTRY_FILE_FULL,
    output: { path: OUTPUT_PATH_FULL, filename: "bundle.js" },
    plugins: [plugin],
  });

beforeEach(() => {
  process.chdir(sandbox.dir);
  consoleSpy = jest.spyOn(console, "warn").mockImplementation();
  sandbox.cleanSync();
  createSourceFolder();
});

afterEach(() => {
  process.chdir(cwd);
  consoleSpy.mockReset();
});

afterAll(() => {
  sandbox.destroySandboxSync();
  process.chdir(cwd);
});

test("Test that the plugin initialises", async () => {
  const plugin = new Plugin({ masterLocale: "en" });
  expect(plugin.translations).toEqual(new Map());
});

test("Test that the plugin merges objects and removes keys not found on master", async () => {
  const plugin = new Plugin({ masterLocale: "en" });
  const compiler = getCompiler(plugin);
  await compiler.run();
  expect(sandbox.readFileSync(LANG_TWO_PATH)).toEqual(testTranslations.langTwoMerged);
});

test("Test that plugin produces a CSV of all zipped translations", async () => {
  const plugin = new Plugin({ masterLocale: "en", produceCSV: true });
  const compiler = getCompiler(plugin);
  await compiler.run();
  expect(sandbox.readFileSync(CSV_OUTPUT_PATH)).toEqual(mergedCsv);
});
