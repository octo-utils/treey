/* Created by tommyZZM.OSX on 2018/5/23. */
"use strict";
import isPlainObject from "is-plain-object"
import {
  always,
  wrapReflectGetters,
  reflectGet,
  reflectGetProps,
  reflectGetSymbolKey,
  reflectGetOnlyFunction
} from "./uf"

export const EVENT = {
  VALUE_CHANGED: "VALUE_CHANGED"
}

export const __ = {
  vars: Symbol("vars"),
  vars_raw: Symbol("vars_raw"),
  proxy: Symbol(),
  of_scope: Symbol(),
  todos: Symbol(),
  children_scopes: Symbol()
};

export function scopeProxy(scope_obj, scope_fn, emitter) {
  return new Proxy(scope_fn, _scopeProxyHandler(scope_obj, emitter))
}

function _scopeProxyHandler(scope_obj, emitter) {
  return {
    get(scope_fn, propName, receiver) {
      return wrapReflectGetters(
        reflectGet(scope_fn),
        reflectGetSymbolKey(scope_obj),
        reflectGetProps(scope_obj, ["vars"]),
        reflectGetOnlyFunction(scope_obj),
        reflectGetProps(emitter,["on", "once", "emit"])
      )(propName, receiver);
    },
    set: always(false)
  }
}

export function varsProxy(var_obj, scope_proxy) {
  return new Proxy(var_obj, _varsProxyHandler(scope_proxy))
}

function _varsProxyHandler(scope_proxy) {
  return {
    get(var_obj, propName, receiver) {
      const setValue = getValue => {
        const last_value = var_obj[propName];
        const value = typeof getValue === "function" ?
          getValue(_varsOperators(last_value)) : getValue;

        var_obj[propName] = value;
        scope_proxy.emit(EVENT.VALUE_CHANGED, [propName, value]);
      };

      return wrapReflectGetters(
        _ => setValue
      )(propName, receiver);
    },
    set: always(false)
  }
}

function _varsOperators(value) {
  return Object.assign(resolve => resolve(value), {
    reset(newValue) {
      return newValue;
    },
    ensure_array() {
      return Array.isArray(value) ? value : []
    },
    ensure_plain_object() {
      return isPlainObject(value) ? value : {}
    },
    merge(newValue) {
      if ( Array.isArray(value) ) {
        return value.concat(Array.isArray(newValue) ? newValue : [newValue]);
      }
      if ( isPlainObject(value) && isPlainObject(newValue) ) {
        return Object.assign({}, value, newValue);
      }
      return value;
    },
    filter(filter_fn) {
      if ( Array.isArray(value) ) {
        return value.filter((item) => filter_fn(item))
      }
      return filter_fn(value) ? value : void 0;
    }
  })
}
