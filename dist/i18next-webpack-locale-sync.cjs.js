'use strict';

if (process.env.NODE_ENV === "production") {
  module.exports = require("./i18next-webpack-locale-sync.cjs.prod.js");
} else {
  module.exports = require("./i18next-webpack-locale-sync.cjs.dev.js");
}
