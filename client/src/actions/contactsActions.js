import axios from 'axios';
import { getNewAndUpdatedRows, getRemovedIds } from '../lib/helper';

export function getContacts(dispatch) {
  axios
    .get('/api/contacts')
    .then(response => {
      dispatch({
        type: 'GET_ALL_CONTACTS',
        payload: response.data
      });
    })
    .catch(err => {
      console.error.bind(err);
    });
}

export function createAndUpdateContacts(changes, source) {
  return function(dispatch) {
    const postCallback = function(newRows) {
      axios.post('/api/contacts', { newRows }).then(() => {
        dispatch(getContacts());
      });
    };

    const putCallback = function(updatedRows) {
      axios.put('/api/contacts', { updatedRows }).then(() => {
        dispatch(getContacts());
      });
    };

    const getNewAndUpdatedRowsBound = getNewAndUpdatedRows.bind(this);
    getNewAndUpdatedRowsBound(changes, source, postCallback, putCallback);
  };
}

export function deleteContacts(index, amount) {
  return function(dispatch) {
    // get deleted row ID(s)
    const getRemovedIdsBound = getRemovedIds.bind(this);
    const removedIds = getRemovedIdsBound();
    axios({
      method: 'DELETE',
      url: '/api/contacts',
      data: {
        removedIds
      }
    });
  };
}
