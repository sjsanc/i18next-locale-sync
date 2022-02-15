import { TempSandbox } from "temp-sandbox";
import { Compiler, Configuration, Stats } from "webpack";
import { i18nextLocaleSyncPlugin } from "../src/plugin";

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

const entryFile = "src/index.js";
const entryFileFull = sandbox.path.resolve(entryFile);

const outputPath = "dist";
const outputPathFull = sandbox.path.resolve(outputPath);

const langOnePath = "public/locales/en/translation.json";
const langTwoPath = "public/locales/es/translation.json";

const csvOutputPath = "output.csv";

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

beforeEach(() => {
  process.chdir(sandbox.dir);
  consoleSpy = jest.spyOn(console, "warn").mockImplementation();
  sandbox.cleanSync();
});
afterEach(() => {
  process.chdir(cwd);
  consoleSpy.mockReset();
});
afterAll(() => {
  sandbox.destroySandboxSync();
  process.chdir(cwd);
});

const createSourceFolder = () => {
  sandbox.createFileSync(entryFile);
  sandbox.createFileSync(langOnePath, testTranslations.langOne);
  sandbox.createFileSync(langTwoPath, testTranslations.langTwo);
  sandbox.createDirSync("public/locales/.DS_Store/");
};

test("Test that plugin initialises", async () => {
  createSourceFolder();
  const localeSyncPlugin = new i18nextLocaleSyncPlugin({ masterLocale: "en" });
  const compiler = webpack({
    entry: entryFileFull,
    output: { path: outputPathFull, filename: "bundle.js" },
    plugins: [localeSyncPlugin],
  });
  expect(localeSyncPlugin.translations).toEqual(new Map());
});

test("Test that the plugin merges objects and removes keys not found on master", async () => {
  createSourceFolder();

  const localeSyncPlugin = new i18nextLocaleSyncPlugin({ masterLocale: "en" });
  const compiler = webpack({
    entry: entryFileFull,
    output: { path: outputPathFull, filename: "bundle.js" },
    plugins: [localeSyncPlugin],
  });

  await compiler.run();
  expect(sandbox.readFileSync(langTwoPath)).toEqual(testTranslations.langTwoMerged);
});

test("Test that plugin produces a CSV of all zipped translations", async () => {
  createSourceFolder();

  const localeSyncPlugin = new i18nextLocaleSyncPlugin({ masterLocale: "en", produceCSV: true });
  const compiler = webpack({
    entry: entryFileFull,
    output: { path: outputPathFull, filename: "bundle.js" },
    plugins: [localeSyncPlugin],
  });

  await compiler.run();
  console.log(sandbox.readFileSync(csvOutputPath));
  expect(sandbox.readFileSync(csvOutputPath));
});
