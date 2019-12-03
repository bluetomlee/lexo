import { isFunction, isUndefined } from './util';

const INIT = '@@LEXO/INIT_' + Math.random().toString(18).substring(5);

const Provider = store => params => ({ ...params, store } );

const combineReducers = (reducers) => {
  const keys = [];
  const reducerMap = {};

  Object.keys(reducers).forEach(key => {
    if (isFunction(reducers[key])) {
      keys.push(key);
      reducerMap[key] = reducers[key];
    }
  })

  return (state = {}, action) => {
    const nextState = {};
    let changed = false;

    keys.forEach(key => {
      nextState[key] = reducerMap[key](state[key], action);

      if (!changed) {
        changed = state[key] !== nextState[key];
      }
    })

    return changed ? nextState : state;
  }
}

const createStore = (reducer, initialState, enhancer) => {
  if (isFunction(initialState)) {
    enhancer = initialState;
    initialState = undefined;
  }

  let state = initialState;
  let listeners = [];
  let idx = 0;

  const store = {
    getState() {
      return state;
    },
    dispatch(action) {
      if (action && action.type) {
        state = reducer(state, action);
        listeners.map(j => j());
      }
    },
    subscrible(listener) {
      if (isFunction(listener)) {
        listeners.push(listener);
        return idx++;
      }
    },
    unSubscrible(idx) {
      listeners.splice(idx, 1);
    }
  }

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

export default createStore;

export {
  combineReducers,
  Provider
}