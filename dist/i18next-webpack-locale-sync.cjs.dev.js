'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var csvStringify = require('csv-stringify');
var fs = require('fs');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefault(fs);

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }

  return target;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function () {
      it = it.call(o);
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

/**
 * Transforms multiple JSON documents into a single Map, using dotnested keys as Map keys
 * Lifted from https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
 * @param type either "keys", "values" or null for the initial pass
 * @param object the locale translation data
 * @param output a Map containing the dotnested keys
 * @param nestedKeys top-level key for the next recurse
 */
function extractDotnestedKeys(type, object) {
  var output = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var nestedKeys = arguments.length > 3 ? arguments[3] : undefined;

  for (var _i = 0, _Object$entries = Object.entries(object); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        k = _Object$entries$_i[0],
        val = _Object$entries$_i[1];

    var key = nestedKeys ? nestedKeys + "." + k : k;

    if (typeof val === "string") {
      if (type === "keys") output.push(key);else if (type === "values") output.push(val);else output.push([key, val]);
    } else extractDotnestedKeys(type, val, output, key);
  }

  return new Map(output);
}
/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */

function isObject(item) {
  return item && _typeof(item) === "object" && !Array.isArray(item);
}
/**
 * Deep merge two objects.
 * Lifted from https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
 * @param target
 * @param ...sources
 */

function mergeDeep(target) {
  for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  if (!sources.length) return target;
  var source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (var key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, _defineProperty({}, key, ""));
        mergeDeep(target[key], source[key]);
      } else {
        if (!target[key]) Object.assign(target, _defineProperty({}, key, ""));
      }
    }
  }

  return mergeDeep.apply(void 0, [target].concat(sources));
}
/**
 * Prune any keys that don't appear in the master locale
 * @param target
 * @param ...sources
 */

var pruneKeys = function pruneKeys(target) {
  for (var _len2 = arguments.length, sources = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    sources[_key2 - 1] = arguments[_key2];
  }

  if (!sources.length) return target;
  var source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (var key in target) {
      if (!source[key]) delete target[key];
    }
  }

  return pruneKeys.apply(void 0, [target].concat(sources));
};

var PLUGIN_NAME = "i18nextWebpackLocaleSyncPlugin";
var DEFAULT_LOCALE_FILEPATH = "public/locales";
var DEFAULT_TRANSLATION_FILENAME = "translation.json";
var DEFAULT_OUTDIR = "../..";
var DEFAULT_OUTFILE = "output";
var PLUGIN_PREFIX_COLOR = "\x1b[36m%s\x1b[0m";
var PLUGIN_PREFIX = "[[i18NEXT-LOCALE-SYNC]]";
var Plugin = /*#__PURE__*/function () {
  function Plugin(props) {
    _classCallCheck(this, Plugin);

    _defineProperty(this, "translations", new Map());

    this.masterLocaleKey = props.masterLocale;
    this.produceCSV = props.produceCSV || false;
    this.outDir = props.outDir || DEFAULT_OUTDIR;
    this.outFile = props.outFile || DEFAULT_OUTFILE;
    this.verbose = props.verbose || false;
  }

  _createClass(Plugin, [{
    key: "log",
    value: function log(text) {
      if (this.verbose) console.log(PLUGIN_PREFIX_COLOR, "".concat(PLUGIN_PREFIX, ": ").concat(text));
    }
  }, {
    key: "apply",
    value: function apply(compiler) {
      var _this = this;

      compiler.hooks.emit.tap(PLUGIN_NAME, function (compilation) {
        if (!fs__default["default"].existsSync(DEFAULT_LOCALE_FILEPATH)) {
          console.error("Unable to find a valid directory at ".concat(DEFAULT_LOCALE_FILEPATH));
          return;
        } else {
          _this.log("Starting translation sync");

          process.chdir(DEFAULT_LOCALE_FILEPATH);
          var cwd = process.cwd(); // Parse the JSON for each locale into memory

          fs__default["default"].readdirSync(cwd).forEach(function (locale) {
            var path = "".concat(cwd, "/").concat(locale, "/").concat(DEFAULT_TRANSLATION_FILENAME);

            if (fs__default["default"].existsSync(path)) {
              _this.translations.set(locale, {
                path: path,
                data: JSON.parse(fs__default["default"].readFileSync(path, "utf-8"))
              });
            }
          }); // Merge and prune the subordinate locales against the master and write to file

          var masterLocaleTranslation = _this.translations.get(_this.masterLocaleKey);

          if (masterLocaleTranslation) {
            var masterLocaleData = masterLocaleTranslation.data;

            _this.translations.forEach(function (subLocale, subLocaleKey) {
              if (subLocaleKey !== _this.masterLocaleKey) {
                var mergedData = mergeDeep(subLocale.data, masterLocaleData);
                var prunedData = pruneKeys(mergedData, masterLocaleData);
                fs__default["default"].writeFileSync(subLocale.path, JSON.stringify(prunedData));

                _this.log("".concat(subLocaleKey, " updated"));
              }
            });
          } // Produce a CSV of the merged locales and their shared dotnested keys


          if (_this.produceCSV) {
            var zipMap = new Map();
            var columns = {
              key: "key"
            };

            _this.translations.forEach(function (locale, localeKey) {
              var dotnestedEntries = extractDotnestedKeys(null, locale.data);
              console.log(dotnestedEntries);
              columns[localeKey] = localeKey;

              var _iterator = _createForOfIteratorHelper(dotnestedEntries.entries()),
                  _step;

              try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  var _step$value = _slicedToArray(_step.value, 2),
                      key = _step$value[0],
                      val = _step$value[1];

                  if (zipMap.get(key)) {
                    zipMap.set(key, _objectSpread2(_objectSpread2({}, zipMap.get(key)), _defineProperty({}, localeKey, val)));
                  } else {
                    zipMap.set(key, _defineProperty({}, localeKey, val));
                  }
                }
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }
            }); // Write the CSV to default output location


            var csvLikeArray = Array.from(zipMap, function (_ref) {
              var _ref2 = _slicedToArray(_ref, 2),
                  k = _ref2[0],
                  v = _ref2[1];

              return _objectSpread2(_objectSpread2({}, {
                k: k
              }), v);
            });
            process.chdir(_this.outDir);
            csvStringify.stringify(csvLikeArray, {
              header: true,
              columns: columns
            }, function (err, out) {
              fs__default["default"].writeFile("".concat(_this.outFile, ".csv"), out, function (err) {
                if (err) throw err;else _this.log("Merged CSV produced");
              });
            });
          }

          _this.log("Sync completed");
        }
      });
    }
  }]);

  return Plugin;
}();

exports["default"] = Plugin;
