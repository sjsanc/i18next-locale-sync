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

function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
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

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
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

var _require = require("webpack");
    _require.Compilation;
    _require.Compiler;

var fs = require("fs");

var _require2 = require("csv-stringify"),
    stringify = _require2.stringify;

var i18nextLocaleSyncPlugin = /*#__PURE__*/function () {
  function i18nextLocaleSyncPlugin(props) {
    _classCallCheck(this, i18nextLocaleSyncPlugin);

    _defineProperty(this, "produceCSV", false);

    _defineProperty(this, "translations", new Map());

    this.masterLocale = props.masterLocale;
    this.produceCSV = props.produceCSV;
  } // Rescursively extracts the dotnested path for each JSON key


  _createClass(i18nextLocaleSyncPlugin, [{
    key: "extract",
    value: function extract(type, object) {
      var output = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var nestedKeys = arguments.length > 3 ? arguments[3] : undefined;

      for (var _i = 0, _Object$entries = Object.entries(object); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            k = _Object$entries$_i[0],
            val = _Object$entries$_i[1];

        var key = nestedKeys ? nestedKeys + "." + k : k;

        if (typeof val === "string") {
          if (type === "keys") output.push(key);else if (type === "values") output.push(val);else output.push([key, val]);
        } else this.extract(type, val, output, key);
      }

      return new Map(output);
    }
  }, {
    key: "isObject",
    value: function isObject(item) {
      return item && _typeof(item) === "object" && !Array.isArray(item);
    }
  }, {
    key: "diff",
    value: function diff(target) {
      for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        sources[_key - 1] = arguments[_key];
      }

      if (!sources.length) return target;
      var source = sources.shift();

      if (this.isObject(target) && this.isObject(source)) {
        for (var key in target) {
          if (!source[key]) delete target[key];
        }
      }

      return this.diff.apply(this, [target].concat(sources));
    }
  }, {
    key: "mergeDeep",
    value: function mergeDeep(target) {
      for (var _len2 = arguments.length, sources = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        sources[_key2 - 1] = arguments[_key2];
      }

      if (!sources.length) return target;
      var source = sources.shift();

      if (this.isObject(target) && this.isObject(source)) {
        for (var key in source) {
          if (this.isObject(source[key])) {
            if (!target[key]) Object.assign(target, _defineProperty({}, key, ""));
            this.mergeDeep(target[key], source[key]);
          } else {
            if (!target[key]) Object.assign(target, _defineProperty({}, key, ""));
          }
        }
      }

      return this.mergeDeep.apply(this, [target].concat(sources));
    }
  }, {
    key: "zipMaps",
    value: function zipMaps(mapsArr) {
      var zipped = new Map();
      mapsArr.forEach(function (map) {
        var lang = map.get(".LANG");

        var _iterator = _createForOfIteratorHelper(map.entries()),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _step$value = _slicedToArray(_step.value, 2),
                key = _step$value[0],
                value = _step$value[1];

            if (key !== ".LANG") {
              if (zipped.get(key)) {
                var merged = _objectSpread2(_objectSpread2({}, zipped.get(key)), _defineProperty({}, lang, value));

                zipped.set(key, merged);
              } else {
                zipped.set(key, _defineProperty({}, lang, value));
              }
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      });
      return Array.from(zipped, function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            value = _ref2[1];

        return _objectSpread2(_objectSpread2({}, {
          key: key
        }), value);
      });
    }
  }, {
    key: "apply",
    value: function apply(compiler) {
      var _this = this;

      compiler.hooks.emit.tap("i18nextLocaleSyncPlugin", function (compilation) {
        if (!fs.existsSync("public/locales")) {
          console.error("Unable to find an entry direction at 'public/locales'");
          return;
        }

        process.chdir("public/locales");
        var cwd = process.cwd();
        fs.readdirSync(cwd).forEach(function (l) {
          var path = "".concat(cwd, "/").concat(l, "/translation.json");
          if (fs.existsSync(path)) _this.translations.set(l, {
            path: path,
            data: JSON.parse(fs.readFileSync(path, "utf-8"))
          });
        });

        if (_this.masterLocale) {
          var masterData = _this.translations.get(_this.masterLocale).data;

          _this.translations.forEach(function (v, k) {
            if (k !== _this.masterLocale) {
              var updated = _this.diff(_this.mergeDeep(v.data, masterData), masterData);

              fs.writeFileSync(v.path, JSON.stringify(updated));
            }
          });
        }

        if (_this.produceCSV) {
          var zip = new Map();
          var columns = {
            key: "key"
          };

          _this.translations.forEach(function (v, lang) {
            var data = _this.extract(null, v.data);

            columns[lang] = lang;

            var _iterator2 = _createForOfIteratorHelper(data.entries()),
                _step2;

            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var _step2$value = _slicedToArray(_step2.value, 2),
                    key = _step2$value[0],
                    val = _step2$value[1];

                if (zip.get(key)) {
                  zip.set(key, _objectSpread2(_objectSpread2({}, zip.get(key)), _defineProperty({}, lang, val)));
                } else {
                  zip.set(key, _defineProperty({}, lang, val));
                }
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
          });

          var prepped = Array.from(zip, function (_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2),
                key = _ref4[0],
                val = _ref4[1];

            return _objectSpread2(_objectSpread2({}, {
              key: key
            }), val);
          });
          process.chdir("../..");
          stringify(prepped, {
            header: true,
            columns: columns
          }, function (err, out) {
            fs.writeFile("output.csv", out, function (err) {
              if (err) throw err;
            });
          });
        }
      });
    }
  }]);

  return i18nextLocaleSyncPlugin;
}();

module.exports = i18nextLocaleSyncPlugin;
