export default function reduxLogger(store) {
  return function(next) {
    return function(action) {
      console.log("before update: ", store.getState());
      next(action);
      console.log("after update: ", store.getState());
    };
  };
}