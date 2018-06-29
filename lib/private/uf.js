/* Created by tommyZZM.OSX on 2018/5/23. */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.noop = noop;
exports.pass = pass;
exports.always = always;
exports.decorowrap = decorowrap;
exports.wrapDecorators = wrapDecorators;
exports.wrapReflectGetters = wrapReflectGetters;
exports.reflectGet = reflectGet;
exports.reflectGetProps = reflectGetProps;
exports.reflectGetSymbolKey = reflectGetSymbolKey;
exports.reflectGetOnlyFunction = reflectGetOnlyFunction;
exports.EVENT = void 0;
const EVENT = {
  VALUE_CHANGED: "VALUE_CHANGED",
  METHOD_DEFINED: "METHOD_DEFINED"
};
exports.EVENT = EVENT;

function noop() {}

function pass(sth) {
  return sth;
}

function always(value) {
  return _ => value;
}

function decorowrap(wrapper = pass) {
  return (target, name, descriptor) => {
    let last_descriptor_value = descriptor.value;

    descriptor.value = (...args) => {
      return wrapper(last_descriptor_value(...args));
    };

    return descriptor;
  };
}

function wrapDecorators(...decorators) {
  return (...args) => {
    let descriptor;

    for (let decorator of decorators) {
      let _should_be_descriptor = decorator(...args);

      if (_should_be_descriptor) descriptor = _should_be_descriptor;
    }

    return descriptor;
  };
}

function wrapReflectGetters(reflects) {
  return (propName, receiver) => {
    let prop = void 0; // console.log(reflects.map(f => f.toString()))

    for (let get of reflects) {
      let _should_be_defined = get(propName, receiver);

      if (_should_be_defined) {
        prop = _should_be_defined;
        break;
      }
    }

    return prop;
  };
}

function reflectGet(target) {
  return (propName, receiver) => Reflect.get(target, propName);
}

function reflectGetProps(target, propMap) {
  return (propName, receiver) => {
    return propMap.includes(propName) ? Reflect.get(target, propName, receiver) : void 0;
  };
}

function reflectGetSymbolKey(target) {
  return (propName, receiver) => {
    return typeof propName === "symbol" ? Reflect.get(target, propName, receiver) : void 0;
  };
}

function reflectGetOnlyFunction(target, targetToBind) {
  return (propName, receiver) => {
    let prop = Reflect.get(target, propName, receiver);
    return typeof prop === "function" ? prop.bind(targetToBind) : void 0;
  };
}