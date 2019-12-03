(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.lexo = {}));
}(this, function (exports) { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  var type = function type(val) {
    return Object.prototype.toString.call(val).split(' ')[1].split(']')[0].toLowerCase();
  };

  var isFunction = function isFunction(val) {
    return type(val) === 'function';
  };

  var isUndefined = function isUndefined(val) {
    return type(val) === 'undefined';
  };

  var compose = function compose() {
    for (var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++) {
      fns[_key] = arguments[_key];
    }

    return fns.reduce(function (f, g) {
      return function () {
        return f(g.apply(void 0, arguments));
      };
    });
  };

  var noop = function noop() {};

  var shallowEqual = function shallowEqual(a, b) {
    if (a === b) {
      return true;
    }

    if (!a || !b) {
      return false;
    }

    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);
    var len = aKeys.length;

    if (bKeys.length !== len) {
      return false;
    }

    for (var i = 0; i < len; i++) {
      var key = aKeys[i];

      if (a[key] !== b[key]) {
        return false;
      }
    }

    return true;
  };

  var INIT = '@@LEXO/INIT_' + Math.random().toString(18).substring(5);

  var Provider = function Provider(store) {
    return function (params) {
      return _objectSpread({}, params, {
        store: store
      });
    };
  };

  var combineReducers = function combineReducers(reducers) {
    var keys = [];
    var reducerMap = {};
    Object.keys(reducers).forEach(function (key) {
      if (isFunction(reducers[key])) {
        keys.push(key);
        reducerMap[key] = reducers[key];
      }
    });
    return function () {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var action = arguments.length > 1 ? arguments[1] : undefined;
      var nextState = {};
      var changed = false;
      keys.forEach(function (key) {
        nextState[key] = reducerMap[key](state[key], action);

        if (!changed) {
          changed = state[key] !== nextState[key];
        }
      });
      return changed ? nextState : state;
    };
  };

  var createStore = function createStore(reducer, initialState, enhancer) {
    if (isFunction(initialState)) {
      enhancer = initialState;
      initialState = undefined;
    }

    var state = initialState;
    var listeners = [];
    var idx = 0;
    var store = {
      getState: function getState() {
        return state;
      },
      dispatch: function dispatch(action) {
        if (action && action.type) {
          state = reducer(state, action);
          listeners.map(function (j) {
            return j();
          });
        }
      },
      subscrible: function subscrible(listener) {
        if (isFunction(listener)) {
          listeners.push(listener);
          return idx++;
        }
      },
      unSubscrible: function unSubscrible(idx) {
        listeners.splice(idx, 1);
      }
    };

    if (isUndefined(initialState)) {
      store.dispatch({
        type: INIT
      });
    }

    if (isFunction(enhancer)) {
      return enhancer(store);
    }

    return store;
  };

  function applyMiddleware() {
    for (var _len = arguments.length, middlewares = new Array(_len), _key = 0; _key < _len; _key++) {
      middlewares[_key] = arguments[_key];
    }

    return function (store) {
      var arr = middlewares.map(function (middleware) {
        return middleware(store);
      });
      store.dispatch = compose.apply(void 0, _toConsumableArray(arr))(store.dispatch);
      return store;
    };
  }

  var SAGA_ARGUMENT_ERROR = "Saga must be a Generator function";

  function isGenerator(fn) {
    return fn.constructor.name === 'GeneratorFunction';
  }

  function sagaMiddleware(saga) {
    if (!isGenerator(saga)) throw new Error(SAGA_ARGUMENT_ERROR);
    return function (_ref) {
      var getState = _ref.getState,
          dispatch = _ref.dispatch;
      return function (next) {
        return function (action) {
          var result = next(action);
          var generator = saga(getState, action);
          iterate(generator);
          return result;

          function iterate(generator) {
            step();

            function step(arg, isError) {
              var _ref2 = isError ? generator["throw"](arg) : generator.next(arg),
                  effect = _ref2.value,
                  done = _ref2.done;

              if (!done) {
                var response;

                if (isFunction(effect)) {
                  response = effect();
                } else if (Array.isArray(effect) && isFunction(effect[0])) {
                  response = effect[0].apply(effect, _toConsumableArray(effect.slice(1)));
                } else {
                  response = dispatch(effect);
                }

                Promise.resolve(response).then(step, function (err) {
                  return step(err, true);
                });
              }
            }
          }
        };
      };
    };
  }

  function reduxLogger(store) {
    return function (next) {
      return function (action) {
        console.log("before update: ", store.getState());
        next(action);
        console.log("after update: ", store.getState());
      };
    };
  }

  var thunk = (function (_ref) {
    var dispatch = _ref.dispatch,
        getState = _ref.getState;
    return function (next) {
      return function (action) {
        if (typeof action === 'function') {
          return action(dispatch, getState);
        }

        return next(action);
      };
    };
  });

  function bindActionCreator(actionCreator, dispatch) {
    return function () {
      return dispatch(actionCreator.apply(void 0, arguments));
    };
  }
  function bindActionCreators(actions, dispatch) {
    var creators = {};
    Object.keys(actions).map(function (j) {
      var funcItem = actions[j];

      if (isFunction(funcItem)) {
        creators[j] = bindActionCreator(actions[j], dispatch);
      }
    });
    return creators;
  }

  var TS = Object.prototype.toString;
  var OA = '[object Array]';
  var OO = '[object Object]';
  function flatDeepDiff(prev, next) {
    if (TS.call(prev) !== OO || TS.call(next) !== OO) {
      throw new TypeError('parameter must be object');
    }

    var flatDiff = {};
    var initPath = '';
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
    var ntype = TS.call(next);
    var ptype = TS.call(prev);
    var isOO = ntype === OO && ptype === OO;
    var isOA = ntype === OA && ptype === OA;

    if (isOO) {
      if (isEmpty(prev)) {
        flatDiff[path] = next;
      } else {
        for (var key in next) {
          if (!next.hasOwnProperty(key)) return;
          var flatKey = path + (path.length ? '.' + key : key);
          var nValue = next[key];
          var pValue = prev[key];
          var nVtype = TS.call(nValue);
          var pVtype = TS.call(pValue);

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
      next.forEach(function (item, idx) {
        deepDiff(prev[idx], item, path + '[' + idx + ']', flatDiff);
      });
    } else {
      flatDiff[path] = next;
    }

    return flatDiff;
  }

  function fillKeys(prev, next, path, flatDiff) {
    if (prev === next) return;
    var ntype = TS.call(next);
    var ptype = TS.call(prev);
    var isOO = ntype === OO && ptype === OO;

    if (isOO) {
      for (var key in prev) {
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

  var connect = function connect() {
    var mapStateToProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : noop;
    var mapActionToProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var app = getApp();
    return function () {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var commponentDidMount = params.didMount;
      var commponentDidUnMount = params.didUnmount;
      var pageOnload = params.onLoad;
      var idx;

      var onLoad = function onLoad(query) {
        initStore.call(this);

        if (isFunction(pageOnload)) {
          pageOnload.call(this, query);
        }
      };

      var initStore = function initStore() {
        var store = this.store = app.store;

        if (store && store.subscrible) {
          idx = store.subscrible(setState.bind(this));
          setState.call(this);
        }
      };

      var didMount = function didMount() {
        initStore.call(this);

        if (isFunction(commponentDidMount)) {
          commponentDidMount.call(this);
        }
      };

      var didUnmount = function didUnmount() {
        if (isFunction(commponentDidUnMount)) {
          commponentDidUnMount.call(this);
        }

        this.__unmount = true;
        this.store.unSubscrible(idx);
      };

      var setState = function setState() {
        if (this.__unmount) {
          return;
        }

        var oldState = this.data || {};
        var state = mapStateToProps(this.store.getState());
        var dispatches = bindActionCreators(mapActionToProps, this.store.dispatch);

        var newState = _objectSpread({}, oldState, state);

        if (!shallowEqual(oldState, newState)) {
          var diff = flatDeepDiff(oldState, newState) || newState;
          this.setData(diff);
        }

        if (!this.dispatch) {
          for (var j in dispatches) {
            this[j] = dispatches[j];
          }

          this.dispatch = this.store.dispatch;
        }
      };

      return _objectSpread({}, params, {
        didMount: didMount,
        didUnmount: didUnmount,
        onLoad: onLoad
      });
    };
  };

  exports.applyMiddleware = applyMiddleware;
  exports.combineReducers = combineReducers;
  exports.connect = connect;
  exports.createStore = createStore;
  exports.default = Provider;
  exports.reduxLogger = reduxLogger;
  exports.sagaMiddleware = sagaMiddleware;
  exports.thunk = thunk;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
