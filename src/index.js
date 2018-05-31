/* Created by tommyZZM.OSX on 2018/5/22. */
"use strict";
import EventEmitter from "events"
import { nonenumerable, nonconfigurable, readonly } from "core-decorators"
import { __, scopeProxy, varsProxy } from "./private/proxies"
import { noop, pass, wrapDecorators, assignPrivate } from "./private/uf"

const private_decorator = wrapDecorators(
  nonenumerable,
  nonconfigurable,
  readonly
)

class TreeyScope {

  [__.children_scopes] = []

  constructor(name, of_scope, fn) {
    const emitter = new EventEmitter()
    const proxy = scopeProxy(this, fn, emitter);
    const vars_raw = {
      @private_decorator
      __children:[]
    };

    this[__.vars_raw] = vars_raw;
    this[__.vars] = varsProxy(vars_raw, proxy);
    this[__.proxy] = proxy;
    this[__.of_scope] = of_scope;
    this[__.todos] = [];

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
    const def = defFn(this[__.vars]);
    const actual_fn = (...inputs) => def(...inputs);
    assignPrivate({
      [name]: actual_fn
    }, this);
  }

  get vars() {
    return this[__.vars];
  }

  @private_decorator
  toData(deep = false) {
    return this[__.todos].reduce(
      (last, todo) => last.then(_ => Promise.resolve(todo())),
      Promise.resolve()
    )
      .then(_ => {
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
    Promise.resolve().then(_ => child(child_scope_ins[__.proxy], child_scope_ins[__.vars]));
    return child_scope_ins[__.proxy];
  }
}

export function create(fn = noop) {
  const root_scope_ins = scope();
  Promise.resolve().then(_ => fn(root_scope_ins[__.proxy], root_scope_ins[__.vars]));
  return root_scope_ins[__.proxy];
}
