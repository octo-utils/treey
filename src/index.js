/* Created by tommyZZM.OSX on 2018/5/22. */
"use strict";
import EventEmitter from "events"
import objectAssignProperties from 'object-assign-properties'
import { nonenumerable, nonconfigurable, readonly } from "core-decorators"
import { __, scopeProxy, varsReadonlyProxy } from "./private/proxies"
import { EVENT, noop, pass, wrapDecorators } from "./private/uf"

const private_decorator = wrapDecorators(
  nonenumerable,
  nonconfigurable,
  readonly
)

const private_decorator_accessor = wrapDecorators(
  nonenumerable,
  nonconfigurable
)

const assignReadonly = objectAssignProperties({
  enumerable: true,
  configurable: false,
  writable: false
})

class TreeyScope {

  [__.children_scopes] = [];

  constructor(name, of_scope, fn) {
    const of_scopes = [];
    let _curr_of_scope = of_scope;
    while (_curr_of_scope) {
      of_scopes.push(_curr_of_scope);
      _curr_of_scope = _curr_of_scope[__.of_scope];
    }
    this[__.of_scope] = of_scope;
    this[__.of_scopes_array] = of_scopes;

    const emitter = new EventEmitter()
    const proxy = scopeProxy(this, fn, emitter);
    const vars_raw = {
      @private_decorator
      __children:[]
    };

    this[__.vars_raw] = vars_raw;
    this[__.vars_read] = varsReadonlyProxy(vars_raw, of_scopes.map(scope => scope[__.vars_raw]));
    this[__.proxy] = proxy;

    assignReadonly({
      EVENT: EVENT
    }, this);

    if (of_scope) {
      const of_children_scope = of_scope[__.children_scopes];
      let generation_scope = of_children_scope
      if (!Array.isArray(of_children_scope)) {
        of_scope[__.children_scopes] = generation_scope = [];
      }
      generation_scope.push([name, this]);
    }
  }

  @private_decorator
  def(name, defFn) {
    const actual_fn = function (...inputs) {
      return defFn(this[__.proxy])(...inputs)
    };
    assignReadonly({
      [name]: actual_fn
    }, this);
    this[__.proxy].emit(EVENT.METHOD_DEFINED, [name]);
  }

  @private_decorator
  set_var(varName, value) {
    const vars_raw = this[__.vars_raw];
    vars_raw[varName] = value;
    this[__.proxy].emit(EVENT.VALUE_CHANGED, [varName, value]);
  }

  @private_decorator_accessor
  set vars(vars_to_assign) {
    return Object.assign(this[__.vars_raw], vars_to_assign);
  }

  @private_decorator_accessor
  get vars() {
    return this[__.vars_read];
  }

  @private_decorator
  toData(deep = false) {
    return Promise.resolve().then(_ => {
        const self = this;
        self[__.vars_raw].__children.length = 0;
        return {
          ...self[__.vars_raw],
          @readonly
          get $children() {
            return self[__.vars_raw].__children
          }
        }
      })
      .then(deep ? (vars_to_return => this[__.children_scopes].reduce(
        (last, [name, scope]) => last
          .then(_ => scope.toData(deep))
          .then(data => {
            this[__.vars_raw].__children.push([name, data])
            return vars_to_return;
          })
        ,
        Promise.resolve(vars_to_return)
      )) : pass)
  }
}

function scope(name = null, parent_scope = null) {
  const scope_ins = new TreeyScope(name, parent_scope, fn);
  return scope_ins;

  function fn(name, child) {
    const child_scope_ins = scope(name, scope_ins);
    Promise.resolve().then(_ => {
      child(child_scope_ins[__.proxy], child_scope_ins[__.vars_read])
      return true;
    });
    return child_scope_ins[__.proxy];
  }
}

export function create(fn = noop) {
  const root_scope_ins = scope();
  Promise.resolve().then(_ => fn(root_scope_ins[__.proxy], root_scope_ins[__.vars_read]));
  return root_scope_ins[__.proxy];
}
