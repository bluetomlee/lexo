import { compose } from './util';

export default function applyMiddleware (...middlewares) {
  return store => {
    const arr = middlewares.map(middleware => middleware(store));
    store.dispatch = compose(...arr)(store.dispatch);

    return store;
  }
};