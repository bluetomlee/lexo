import createStore, { combineReducers, Provider } from './store';
import applyMiddleware from './middleware';
import sagaMiddleware from './plugin/saga';
import reduxLogger from './plugin/logger';
import thunk from './plugin/thunk';
import connect from './connect';

export default Provider;

export {
  createStore,
  connect,
  combineReducers,
  applyMiddleware,
  reduxLogger,
  sagaMiddleware,
  thunk
}