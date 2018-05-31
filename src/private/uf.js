/* Created by tommyZZM.OSX on 2018/5/23. */
"use strict";
import objectAssignProperties from 'object-assign-properties'

export const unreachable = Symbol("symbol_unreachable");

export function noop() {}

export function always(value) {
  return _ => value;
}

export function is_typeof_string(target) {
  return typeof target === "string";
}

export function is_primitive(target) {
  return typeof target === "string" ||
    typeof target === "number" ||
    typeof target === "boolean" ||
    target instanceof RegExp ||
    typeof target === "symbol" ||
    typeof target === "undefined" ||
    target === null;
}

export function wrapDecorators(...decorators) {
  return (...args) => {
    let descriptor
    for (let decorator of decorators) {
      let _should_be_descriptor = decorator(...args);
      if (_should_be_descriptor) descriptor = _should_be_descriptor;
    }
    return descriptor;
  }
}

export const assignPrivate = objectAssignProperties({
  enumerable: false,
  configurable: false,
  writable: false
})

export function wrapReflectGetters(...reflects) {
  return (propName, receiver) => {
    let prop = void 0;
    // console.log(reflects.map(f => f.toString()))
    for (let get of reflects) {
      let _should_be_defined = get(propName, receiver);
      if (_should_be_defined) {
        prop = _should_be_defined;
        break;
      }
    }
    return prop;
  }
}

export function reflectGet(target) {
  return (propName, receiver) => Reflect.get(target, propName, receiver);
}

export function reflectGetProps(target, propMap) {
  return (propName, receiver) => propMap.includes(propName) ?
    Reflect.get(target, propName, receiver) : void 0;
}

export function reflectGetSymbolKey(target) {
  return (propName, receiver) => {
    return typeof propName === "symbol" ? Reflect.get(target, propName, receiver) : void 0;
  }
}

export function reflectGetOnlyFunction(target) {
  return (propName, receiver) => {
    let prop = Reflect.get(target, propName, receiver);
    return typeof prop === "function" ? prop : void 0;
  }
}
