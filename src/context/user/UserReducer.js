
export default (state, action) => {
  switch (action.type) {
    case 'USER_SET':
      return { ...state, user: { ...action.user } }
    default:
      return state
  }
}