import { noop, isFunction, shallowEqual } from './util';
import bindActionCreators from './bindActionCreator';
import deepDiff from './diff';

const connect = (mapStateToProps = noop, mapActionToProps = {}) => {
  let app = getApp();

  return (params = {}) => {
    let commponentDidMount = params.didMount;
    let commponentDidUnMount = params.didUnmount;
    let pageOnload = params.onLoad;
    let idx;

    const onLoad = function (query) {
      initStore.call(this);
      if (isFunction(pageOnload)) {
        pageOnload.call(this, query);
      }
    }

    const initStore = function () {
      let store = this.store = app.store;

      if (store && store.subscrible) {
        idx = store.subscrible(setState.bind(this));
        setState.call(this);
      }
    }

    const didMount = function () {
      initStore.call(this);
      if (isFunction(commponentDidMount)) {
        commponentDidMount.call(this);
      }
    };

    const didUnmount = function () {
      if (isFunction(commponentDidUnMount)) {
        commponentDidUnMount.call(this);
      }
      this.__unmount = true;
      this.store.unSubscrible(idx);
    };

    const setState = function () {

      if (this.__unmount) {
        return;
      }

      const oldState = this.data || {};
      const state = mapStateToProps(this.store.getState());
      const dispatches = bindActionCreators(mapActionToProps, this.store.dispatch);
      const newState = {
        ...oldState,
        ...state
      };

      if (!shallowEqual(oldState, newState)) {
        let diff = deepDiff(oldState, newState) || newState;
        this.setData(diff);
      }

      if (!this.dispatch) {
        for (var j in dispatches) {
          this[j] = dispatches[j];
        }
        this.dispatch = this.store.dispatch;
      }
    }

    return {
      ...params,
      didMount,
      didUnmount,
      onLoad
    };
  }
}

export default connect;