const initialState = {
  count: 0
}

export default (state = initialState, action) => {
    if (action.type === 'ADD') {
      return {
        ...state,
        count: state.count + 1
      }
    } else {
      return state;
    }
}