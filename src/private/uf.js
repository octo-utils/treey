/* Created by tommyZZM.OSX on 2018/5/23. */
"use strict";

export const EVENT = {
  VALUE_CHANGED: "VALUE_CHANGED",
  METHOD_DEFINED: "METHOD_DEFINED"
}

export function noop() {}

export function pass(sth) {
  return sth;
}

export function always(value) {
  return _ => value;
}

export function decorowrap(wrapper = pass){
  return (target, name, descriptor) => {
    let last_descriptor_value = descriptor.value;
    descriptor.value = (...args) => {
      return wrapper(last_descriptor_value(...args));
    }
    return descriptor;
  }
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

export function wrapReflectGetters(reflects) {
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
  return (propName, receiver) => Reflect.get(target, propName);
}

export function reflectGetProps(target, propMap) {
  return (propName, receiver) => {
    return propMap.includes(propName) ?
      Reflect.get(target, propName, receiver) : void 0;
  }
}

export function reflectGetSymbolKey(target) {
  return (propName, receiver) => {
    return typeof propName === "symbol" ? Reflect.get(target, propName, receiver) : void 0;
  }
}

export function reflectGetOnlyFunction(target, targetToBind) {
  return (propName, receiver) => {
    let prop = Reflect.get(target, propName, receiver);
    return typeof prop === "function" ? prop.bind(targetToBind) : void 0;
  }
}
