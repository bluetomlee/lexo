import { connect } from '@ali/lexo';
import { add } from '../../../store/actions/count';

const app = getApp();

const initData = {
  data: {

  },
  didMount() {

  },
  methods: {
    add() {
      this.dispatch.add();
    }
  }
};
const mapStateToProps = (state) => {
  return state;
}
Component(connect(mapStateToProps, {
  add
})(initData));
