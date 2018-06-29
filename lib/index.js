/* Created by tommyZZM.OSX on 2018/5/22. */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;

var _events = _interopRequireDefault(require("events"));

var _objectAssignProperties = _interopRequireDefault(require("object-assign-properties"));

var _coreDecorators = require("core-decorators");

var _proxies = require("./private/proxies");

var _uf = require("./private/uf");

var _class, _class2, _$children_scopes, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object['ke' + 'ys'](descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object['define' + 'Property'](target, property, desc); desc = null; } return desc; }

const private_decorator = (0, _uf.wrapDecorators)(_coreDecorators.nonenumerable, _coreDecorators.nonconfigurable, _coreDecorators.readonly);
const private_decorator_accessor = (0, _uf.wrapDecorators)(_coreDecorators.nonenumerable, _coreDecorators.nonconfigurable);
const assignReadonly = (0, _objectAssignProperties.default)({
  enumerable: true,
  configurable: false,
  writable: false
});
let TreeyScope = (_class = (_temp = (_$children_scopes = _proxies.__.children_scopes, _class2 = class TreeyScope {
  constructor(name, of_scope, fn) {
    var _obj, _init;

    _defineProperty(this, _$children_scopes, []);

    const of_scopes = [];
    let _curr_of_scope = of_scope;

    while (_curr_of_scope) {
      of_scopes.push(_curr_of_scope);
      _curr_of_scope = _curr_of_scope[_proxies.__.of_scope];
    }

    this[_proxies.__.of_scope] = of_scope;
    this[_proxies.__.of_scopes_array] = of_scopes;
    const emitter = new _events.default();
    const proxy = (0, _proxies.scopeProxy)(this, fn, emitter);
    const vars_raw = (_obj = {
      __children: []
    }, (_applyDecoratedDescriptor(_obj, "__children", [private_decorator], (_init = Object.getOwnPropertyDescriptor(_obj, "__children"), _init = _init ? _init.value : undefined, {
      enumerable: true,
      configurable: true,
      writable: true,
      initializer: function () {
        return _init;
      }
    }), _obj)), _obj);
    this[_proxies.__.vars_raw] = vars_raw;
    this[_proxies.__.vars_read] = (0, _proxies.varsReadonlyProxy)(vars_raw, of_scopes.map(scope => scope[_proxies.__.vars_raw]));
    this[_proxies.__.proxy] = proxy;
    assignReadonly({
      EVENT: _uf.EVENT
    }, this);

    if (of_scope) {
      const of_children_scope = of_scope[_proxies.__.children_scopes];
      let generation_scope = of_children_scope;

      if (!Array.isArray(of_children_scope)) {
        of_scope[_proxies.__.children_scopes] = generation_scope = [];
      }

      generation_scope.push([name, this]);
    }
  }

  def(name, defFn) {
    const actual_fn = function (...inputs) {
      return defFn(this[_proxies.__.proxy])(...inputs);
    };

    assignReadonly({
      [name]: actual_fn
    }, this);

    this[_proxies.__.proxy].emit(_uf.EVENT.METHOD_DEFINED, [name]);
  }

  set_var(varName, value) {
    const vars_raw = this[_proxies.__.vars_raw];
    vars_raw[varName] = value;

    this[_proxies.__.proxy].emit(_uf.EVENT.VALUE_CHANGED, [varName, value]);
  }

  set vars(vars_to_assign) {
    return Object.assign(this[_proxies.__.vars_raw], vars_to_assign);
  }

  get vars() {
    return this[_proxies.__.vars_read];
  }

  toData(deep = false) {
    return Promise.resolve().then(_ => {
      var _obj2;

      const self = this;
      self[_proxies.__.vars_raw].__children.length = 0;
      return _obj2 = _objectSpread({}, self[_proxies.__.vars_raw], {
        get $children() {
          return self[_proxies.__.vars_raw].__children;
        }

      }), (_applyDecoratedDescriptor(_obj2, "$children", [_coreDecorators.readonly], Object.getOwnPropertyDescriptor(_obj2, "$children"), _obj2)), _obj2;
    }).then(deep ? vars_to_return => this[_proxies.__.children_scopes].reduce((last, [name, scope]) => last.then(_ => scope.toData(deep)).then(data => {
      this[_proxies.__.vars_raw].__children.push([name, data]);

      return vars_to_return;
    }), Promise.resolve(vars_to_return)) : _uf.pass);
  }

}), _temp), (_applyDecoratedDescriptor(_class.prototype, "def", [private_decorator], Object.getOwnPropertyDescriptor(_class.prototype, "def"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "set_var", [private_decorator], Object.getOwnPropertyDescriptor(_class.prototype, "set_var"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "vars", [private_decorator_accessor], Object.getOwnPropertyDescriptor(_class.prototype, "vars"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "vars", [private_decorator_accessor], Object.getOwnPropertyDescriptor(_class.prototype, "vars"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "toData", [private_decorator], Object.getOwnPropertyDescriptor(_class.prototype, "toData"), _class.prototype)), _class);

function scope(name = null, parent_scope = null) {
  const scope_ins = new TreeyScope(name, parent_scope, fn);
  return scope_ins;

  function fn(name, child) {
    const child_scope_ins = scope(name, scope_ins);
    Promise.resolve().then(_ => {
      child(child_scope_ins[_proxies.__.proxy], child_scope_ins[_proxies.__.vars_read]);
      return true;
    });
    return child_scope_ins[_proxies.__.proxy];
  }
}

function create(fn = _uf.noop) {
  const root_scope_ins = scope();
  Promise.resolve().then(_ => fn(root_scope_ins[_proxies.__.proxy], root_scope_ins[_proxies.__.vars_read]));
  return root_scope_ins[_proxies.__.proxy];
}