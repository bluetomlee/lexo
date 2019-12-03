import { isFunction } from './util';

function bindActionCreator (actionCreator, dispatch) {
  return (...args) => dispatch(actionCreator(...args));
};


export default function bindActionCreators(actions, dispatch) {
  let creators = {};
  Object.keys(actions).map(j => {
    let funcItem = actions[j];
    if (isFunction(funcItem)) {
      creators[j] = bindActionCreator(actions[j], dispatch);
    }
  });
  return creators;
};