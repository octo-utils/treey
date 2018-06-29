/* Created by tommyZZM.OSX on 2018/5/23. */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scopeProxy = scopeProxy;
exports.varsReadonlyProxy = varsReadonlyProxy;
exports.varsSetterOperators = varsSetterOperators;
exports.__ = void 0;

var R = _interopRequireWildcard(require("ramda"));

var _isPlainObject = _interopRequireDefault(require("is-plain-object"));

var _uf = require("./uf");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object['ke' + 'ys'](descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object['define' + 'Property'](target, property, desc); desc = null; } return desc; }

const __ = {
  // vars: Symbol("vars"),
  vars_raw: Symbol("vars_raw"),
  vars_read: Symbol("vars_read"),
  proxy: Symbol(),
  of_scope: Symbol(),
  of_scopes_array: Symbol(),
  children_scopes: Symbol()
};
exports.__ = __;

function scopeProxy(scope_obj, scope_fn, emitter) {
  return new Proxy(scope_fn, _scopeProxyHandler(scope_fn, scope_obj, emitter));
}

function _scopeProxyHandler(scope_fn, scope_obj, emitter) {
  const of_scopes_array = scope_obj[__.of_scopes_array];

  const setVarValue = varName => {
    const vars_raw = scope_obj[__.vars_raw];
    const last_value = Reflect.get(vars_raw, varName);

    const setValue = new_value => {
      return scope_obj.set_var(varName, new_value);
    };

    return varsSetterOperators(last_value, setValue, getValue => scope_obj.set_var(varName, typeof getValue === "function" ? getValue(varsSetterOperators(last_value)) : getValue));
  };

  return {
    get(_, propName, receiver) {
      return (0, _uf.wrapReflectGetters)([(0, _uf.reflectGetOnlyFunction)(scope_fn, scope_fn), (0, _uf.reflectGet)(scope_fn), (0, _uf.reflectGetSymbolKey)(scope_obj), (0, _uf.reflectGetProps)(scope_obj, ["vars"]), (0, _uf.reflectGetOnlyFunction)(scope_obj, scope_obj), ...of_scopes_array.map(of_scope_obj => (0, _uf.reflectGetOnlyFunction)(of_scope_obj, scope_obj)), (0, _uf.reflectGetProps)({
        on(event, callback) {
          emitter.on(event, callback);
        },

        once(event, callback) {
          emitter.on(event, callback);
        },

        emit(event, detail) {
          emitter.emit(event, detail);
        }

      }, ["on", "once", "emit"]), setVarValue])(propName, receiver);
    },

    set(_, propName, value, receiver) {
      if (propName === "vars") {
        return Reflect.set(scope_obj, propName, value);
      }

      return false;
    }

  };
}

function varsReadonlyProxy(var_obj, of_scopes_var_objs) {
  const of_scopes_var_objs_getters = of_scopes_var_objs.map(that_var_obj => (0, _uf.reflectGet)(that_var_obj));
  return new Proxy(var_obj, {
    get(_, propName, receiver) {
      return (0, _uf.wrapReflectGetters)([(0, _uf.reflectGet)(var_obj), ...of_scopes_var_objs_getters])(propName, receiver);
    },

    set: (0, _uf.always)(false)
  });
}

function varsSetterOperators(last_value, setValue = _uf.pass, target_handler = Object.create(null)) {
  var _dec, _dec2, _dec3, _dec4, _obj;

  return Object.assign(target_handler, (_dec = (0, _uf.decorowrap)(setValue), _dec2 = (0, _uf.decorowrap)(setValue), _dec3 = (0, _uf.decorowrap)(setValue), _dec4 = (0, _uf.decorowrap)(setValue), (_obj = {
    ensure_array() {
      return Array.isArray(last_value) ? last_value : [];
    },

    ensure_plain_object() {
      return (0, _isPlainObject.default)(last_value) ? last_value : {};
    },

    merge(new_value) {
      if (Array.isArray(last_value)) {
        return last_value.concat(new_value);
      }

      if ((0, _isPlainObject.default)(last_value) && (0, _isPlainObject.default)(new_value)) {
        return R.mergeDeepWith(R.concat, last_value, new_value);
      }

      return last_value;
    },

    filter(filter_fn) {
      if (Array.isArray(last_value) || (0, _isPlainObject.default)(last_value)) {
        return R.filter(filter_fn, last_value);
      }

      return filter_fn(last_value) ? last_value : void 0;
    }

  }, (_applyDecoratedDescriptor(_obj, "ensure_array", [_dec], Object.getOwnPropertyDescriptor(_obj, "ensure_array"), _obj), _applyDecoratedDescriptor(_obj, "ensure_plain_object", [_dec2], Object.getOwnPropertyDescriptor(_obj, "ensure_plain_object"), _obj), _applyDecoratedDescriptor(_obj, "merge", [_dec3], Object.getOwnPropertyDescriptor(_obj, "merge"), _obj), _applyDecoratedDescriptor(_obj, "filter", [_dec4], Object.getOwnPropertyDescriptor(_obj, "filter"), _obj)), _obj)));
}