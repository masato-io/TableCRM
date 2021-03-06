export default function(state = { opportunities: null }, action) {
  switch (action.type) {
  case 'GET_ALL_OPPORTUNITIES':
    return {
      ...state,
      opportunities: action.payload.data
    };
  case 'GET_HIDDENCOLUMNS_OF_OPPORTUNITIES':
    return {
      ...state,
      hiddenColIndices: action.payload
    };
  }
  return state;
}
