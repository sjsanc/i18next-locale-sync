import { TempSandbox } from "temp-sandbox";
import { Compiler, Configuration, Stats } from "webpack";
import i18nextLocaleSyncPlugin from "./plugin";

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

// const publicFile = "public/locales/en/translation.json";
// const publicFileFull = sandbox.path.resolve(publicFile);

const outputPath = "dist";
const outputPathFull = sandbox.path.resolve(outputPath);

const sourcePath = "src";

let consoleSpy: any;
const cwd = process.cwd();

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
  // sandbox.deleteSync(sourcePath);
  sandbox.createFileSync(entryFile);
  sandbox.createFileSync(`public/locales/en/translation.json`, `{ ".LANG": "en", "test": "file" }`);
  sandbox.createFileSync(`public/locales/es/translation.json`, `{ ".LANG": "es", "sub": "" }`);
};

// test("Test sandbox for files and content", async () => {
//   sandbox.deleteSync(sourcePath);
//   sandbox.createFileSync(`public/locales/en/translation.json`, `{ ".LANG": "en", "test": "test" }`);
//   const fileListSync = sandbox.getFileListSync();
//   expect(fileListSync).toEqual(["public/locales/en/translation.json"]);
//   const fileContent = sandbox.readFileSync(fileListSync[0]);
//   expect(fileContent).toEqual({ ".LANG": "en", test: "test" });
// });

test("Test webpack can read files in public folder", async () => {
  createSourceFolder();

  const localeSyncPlugin = new i18nextLocaleSyncPlugin({ masterLocale: "en" });
  const compiler = webpack({
    entry: entryFileFull,
    output: { path: outputPathFull, filename: "bundle.js" },
    plugins: [localeSyncPlugin],
  });

  expect(localeSyncPlugin.translations).toEqual(new Map());
  await compiler.run();
  console.log(localeSyncPlugin.translations);

  // console.log(localeSyncPlugin.translations);
  // expect(localeSyncPlugin.translations).toEqual([
  //   `public/locales/en/translation.json`,
  //   `public/locales/es/translation.json`,
  // ]);
});
