module.exports = {
  entry: path.resolve(__dirname, "index.js"),
  output: {
    filename: "build.js",
    clean: true,
    path: path.resolve(__dirname, "lib"),
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        include: path.resolve(__dirname, "src"),
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [new i18nextWebpackLocaleSync({})],
  resolve: {
    extensions: [".js"],
  },
};
