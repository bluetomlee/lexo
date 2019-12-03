const INCREMENT = 'ADD_ASYNC';
const ADD = 'ADD';

const delay = (millis) => {
  return new Promise(resolve =>
    setTimeout(() => resolve(true), millis )
  )
}

export function increment() {
  return {
    type: ADD
  }
}

function* incrementAsync() {

  yield [delay, 1000]
  yield increment();
}

export default function* rootSaga(getState, action) {
  if (action.type === INCREMENT) {
    yield* incrementAsync()
  }
}
