// from saga;
import { isFunction } from '../util';
const SAGA_ARGUMENT_ERROR = "Saga must be a Generator function";

function isGenerator(fn) {
  return fn.constructor.name === 'GeneratorFunction';
}

export default function sagaMiddleware(saga) {
  if(!isGenerator(saga))
    throw new Error(SAGA_ARGUMENT_ERROR);

  return ({getState, dispatch}) => next => action => {

    const result = next(action);
    const generator = saga(getState, action);
    iterate(generator);

    return result;

    function iterate(generator) {

      step()

      function step(arg, isError) {

        const {value: effect, done} = isError ? generator.throw(arg) : generator.next(arg)

        if (!done) {
          let response;
          if(isFunction(effect)) {
            response = effect()
          } else if(Array.isArray(effect) && isFunction(effect[0])) {
            response = effect[0](...effect.slice(1));
          } else {
            response = dispatch(effect);
          }

          Promise.resolve(response).then(step, err => step(err, true));
        }
      }
    }
  };
}
