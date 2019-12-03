# lexo

支持saga、redux的数据流框架


### 创建reducer
```js
const reducer = (state = {}, action) => {
  switch (action.type) {
    case "ADD":
      return {
        ...state,
        count: ++state.count
      };
    case "MIN_NUM":
      return {
        ...state,
        count: --state.count
      };
    default:
      return state;
  }
};

export default reducer;
```

### 合并多个reducer
```js
combineReducers({
  a,
  b
})
```

### store
```js
import Provider, { createStore } from '@ali/lexo';
import reducer from './reducer';


const store = createStore(reducer);
App(Provider(store)({}));

```

### 创建saga
```js
const createStoreWithSaga = applyMiddleware(
  createLogger(),
  sagaMiddleware(saga)
)(createStore)
```


### 子组件connect
```js

const mapStoreToProps = ({ count }) => { count };

Component(connect(mapStoreToProps)({
  didUnmount() {

  }
}));
```

## 异步thunk触发action

```js
export const fetchList = ({ data } = {}) => async (dispatch, getState) => {
  try {
    dispatch(updateTodo({
      data
    }));
```