import { Compiler } from "webpack";

export class i18nextWebpackLocaleSync {
  public options: any;

  constructor(options: any) {
    this.options = options;
  }
  apply(compiler: Compiler) {
    console.log("RUN");
    compiler.hooks.emit.tapAsync("i18nextWebpackLocaleSync", (compilation, callback) => {
      console.log("Running example plugin", compilation);
      // compilation.addModule
      callback();
    });
  }
}
