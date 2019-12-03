const TS = Object.prototype.toString;
const OA = '[object Array]';
const OO = '[object Object]';

export default function flatDeepDiff(prev, next) {
  if (TS.call(prev) !== OO || TS.call(next) !== OO) {
    throw new TypeError('parameter must be object');
  }

  const flatDiff = {};
  const initPath = '';
  fillKeys(prev, next, initPath, flatDiff);
  deepDiff(prev, next, initPath, flatDiff);

  if (isEmpty(flatDiff)) {
    return null;
  }

  if (flatDiff[''] !== undefined) {
    return flatDiff[''];
  }
  return flatDiff;
}

function deepDiff(prev, next, path, flatDiff) {
  if (prev === next) return;
  const ntype = TS.call(next);
  const ptype = TS.call(prev);
  const isOO = ntype === OO && ptype === OO;
  const isOA = ntype === OA && ptype === OA;

  if (isOO) {
    if (isEmpty(prev)) {
      flatDiff[path] = next;
    } else {
      for (var key in next) {
        if (!next.hasOwnProperty(key)) return;
        const flatKey = path + (path.length ? '.' + key : key);
        const nValue = next[key];
        const pValue = prev[key];
        const nVtype = TS.call(nValue);
        const pVtype = TS.call(pValue);
        if (nVtype !== OO && nVtype !== OA) {
          if (nValue !== pValue) {
            flatDiff[flatKey] = nValue;
          }
        } else if (nVtype === OA) {
          if (pVtype !== OA || nValue.length < pValue.length) {
            flatDiff[flatKey] = nValue;
          } else {
            deepDiff(pValue, nValue, flatKey, flatDiff);
          }
        } else if (nVtype === OO) {
          if (pVtype !== OO) {
            flatDiff[flatKey] = nValue;
          } else {
            deepDiff(pValue, nValue, flatKey, flatDiff);
          }
        }
      }
    }
  } else if (isOA && next.length >= prev.length) {
    next.forEach((item, idx) => {
      deepDiff(prev[idx], item, path + '[' + idx + ']', flatDiff);
    });
  } else {
    flatDiff[path] = next;
  }

  return flatDiff;
}

function fillKeys(prev, next, path, flatDiff) {
  if (prev === next) return;
  const ntype = TS.call(next);
  const ptype = TS.call(prev);
  const isOO = ntype === OO && ptype === OO;

  if (isOO) {
    for (let key in prev) {
      if (!prev.hasOwnProperty(key)) return;

      var flatKey = path + (path.length ? '.' + key : key);
      if (next[key] === undefined && prev[key] !== undefined) {
        flatDiff[flatKey] = null;
      } else {
        fillKeys(prev[key], next[key], flatKey, flatDiff);
      }
    }
  }
}

function isEmpty(value) {
  for (var key in value) {
    if (value.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}