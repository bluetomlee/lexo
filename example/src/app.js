import Provider, { createStore, applyMiddleware, sagaMiddleware } from '@ali/lexo';
import reducer from './store/reducer';
import saga from './store/saga';

const config = {
  onShow() {
    my.call('setBackgroundColor', { backgroundColor: '#000000' });
  },
  globalData: {
    tracert: null
  },
};

const rootSaga = sagaMiddleware(saga);
const store = createStore(reducer, applyMiddleware(rootSaga));
App(Provider(store)(config));