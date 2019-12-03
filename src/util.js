const type = val => Object.prototype.toString.call(val).split(' ')[1].split(']')[0].toLowerCase();
const isFunction = val => type(val) === 'function';
const isObject = val => type(val) === 'object';
const isArray = val => type(val) === 'array';
const isUndefined = val => type(val) === 'undefined';
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));
const noop = () => {};

const shallowEqual = (a, b) => {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  let aKeys = Object.keys(a);
  let bKeys = Object.keys(b);
  let len = aKeys.length;

  if (bKeys.length !== len) {
    return false;
  }

  for (let i = 0; i < len; i++) {
    let key = aKeys[i];

    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}

export {
  isFunction,
  isUndefined,
  isObject,
  isArray,
  compose,
  noop,
  shallowEqual
}