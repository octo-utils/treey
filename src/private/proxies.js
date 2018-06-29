/* Created by tommyZZM.OSX on 2018/5/23. */
"use strict";
import * as R from "ramda"
import isPlainObject from "is-plain-object"
import {
  pass,
  always,
  wrapReflectGetters,
  reflectGet,
  reflectGetProps,
  reflectGetSymbolKey,
  reflectGetOnlyFunction,
  decorowrap
} from "./uf"

export const __ = {
  // vars: Symbol("vars"),
  vars_raw: Symbol("vars_raw"),
  vars_read: Symbol("vars_read"),
  proxy: Symbol(),
  of_scope: Symbol(),
  of_scopes_array: Symbol(),
  children_scopes: Symbol()
};

export function scopeProxy(scope_obj, scope_fn, emitter) {
  return new Proxy(scope_fn, _scopeProxyHandler(scope_fn, scope_obj, emitter))
}

function _scopeProxyHandler(scope_fn, scope_obj, emitter) {

  const of_scopes_array = scope_obj[__.of_scopes_array];

  const setVarValue = varName => {
    const vars_raw = scope_obj[__.vars_raw];
    const last_value = Reflect.get(vars_raw, varName);

    const setValue = new_value => {
      return scope_obj.set_var(varName, new_value);
    };

    return varsSetterOperators(
      last_value,
      setValue,
      getValue => scope_obj.set_var(
        varName,
        typeof getValue === "function" ?
          getValue(varsSetterOperators(last_value)) : getValue
      )
    );
  }

  return {
    get(_, propName, receiver) {
      return wrapReflectGetters([
        reflectGetOnlyFunction(scope_fn, scope_fn),
        reflectGet(scope_fn),
        reflectGetSymbolKey(scope_obj),
        reflectGetProps(scope_obj, ["vars"]),
        reflectGetOnlyFunction(scope_obj, scope_obj),
        ...of_scopes_array.map(of_scope_obj => reflectGetOnlyFunction(of_scope_obj, scope_obj)),
        reflectGetProps({
          on(event, callback) {
            emitter.on(event, callback)
          },
          once(event, callback) {
            emitter.on(event, callback)
          },
          emit(event, detail) {
            emitter.emit(event, detail)
          }
        }, ["on", "once", "emit"]),
        setVarValue
      ])(propName, receiver);
    },
    set(_, propName, value, receiver) {
      if ( propName === "vars" ) {
        return Reflect.set(scope_obj, propName, value);
      }
      return false
    }
  }
}

export function varsReadonlyProxy(var_obj, of_scopes_var_objs) {
  const of_scopes_var_objs_getters = of_scopes_var_objs.map(
    that_var_obj => reflectGet(that_var_obj)
  );
  return new Proxy(var_obj, {
    get(_, propName, receiver) {
      return wrapReflectGetters([
        reflectGet(var_obj),
        ...of_scopes_var_objs_getters
      ])(propName, receiver);
    },
    set: always(false)
  });
}

export function varsSetterOperators(last_value, setValue = pass, target_handler = Object.create(null)) {
  return Object.assign(target_handler, {
    @decorowrap(setValue)
    ensure_array() {
      return Array.isArray(last_value) ? last_value : []
    },
    @decorowrap(setValue)
    ensure_plain_object() {
      return isPlainObject(last_value) ? last_value : {}
    },
    @decorowrap(setValue)
    merge(new_value) {
      if ( Array.isArray(last_value) ) {
        return last_value.concat(new_value);
      }
      if ( (isPlainObject(last_value) && isPlainObject(new_value)) ) {
        return R.mergeDeepWith(R.concat, last_value, new_value);
      }
      return last_value;
    },
    @decorowrap(setValue)
    filter(filter_fn) {
      if ( Array.isArray(last_value) || isPlainObject(last_value) ) {
        return R.filter(filter_fn, last_value);
      }
      return filter_fn(last_value) ? last_value : void 0;
    }
  })
}
