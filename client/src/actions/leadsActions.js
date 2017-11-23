import axios from 'axios';
import moment from 'moment';
import {
  getNewAndUpdatedRows,
  getRemovedIds,
  getSortedColumnsByRank,
  getMovedColumnRange,
  entityColumnsToObj,
  getChangedColumnsObj
} from '../lib/helper';

export function getAllLeads(dispatch) {
  axios
    .get('/api/leads')
    .then(response => {
      for (const row of response.data) {
        if (row.createdAt)
          row.createdAt = moment(new Date(row.createdAt)).format('MM/DD/YYYY');
      }
      return response;
    })
    .then(response => {
      dispatch({
        type: 'GET_ALL_LEADS',
        payload: response.data
      });
    })
    .catch(err => {
      console.error.bind(err);
    });
}

export function createAndUpdateLeads(changes, source) {
  return function(dispatch) {
    const postCallback = function(newRows) {
      axios.post('/api/leads', { newRows }).then(() => {
        dispatch(getAllLeads);
      });
    };

    const putCallback = function(updatedRows) {
      axios.put('/api/leads', { updatedRows }).then(() => {
        dispatch(getAllLeads);
      });
    };

    const getNewAndUpdatedRowsBound = getNewAndUpdatedRows.bind(this);
    getNewAndUpdatedRowsBound(changes, source, postCallback, putCallback);
  };
}

export function deleteLeads(index, amount) {
  return function(dispatch) {
    const selectedRows = this.refs.hot.hotInstance.getSelected();
    const getRemovedIdsBound = getRemovedIds.bind(this);
    const removedIds = getRemovedIdsBound(selectedRows);
    axios({
      method: 'DELETE',
      url: '/api/leads',
      data: {
        removedIds
      }
    });
  };
}

export function getEntityColumnOrders(dispatch) {
  axios
    .get('/api/leads/columnorders')
    .then(response => {
      const columns = response.data;
      const getSortedColumnsByRankBind = getSortedColumnsByRank.bind(this);
      return getSortedColumnsByRankBind(columns);
    })
    .then(columnsHeader => {
      dispatch({
        type: 'GET_ALL_LEADS_COLUMNS_HEADER',
        payload: columnsHeader
      });
    })
    .catch(err => {
      console.error.bind(err);
    });
}

export function updateEntityColumnOrders(columns, target) {
  return function(dispatch) {
    if (target) {
      const afterColumnsArray = this.refs.hot.hotInstance.getColHeader();
      getMovedColumnRange(columns, target).then(movedRange => {
        entityColumnsToObj()
          .then(entityColumnsObj => [entityColumnsObj, movedRange])
          .then(res => {
            const entityColumnsObj = res[0];
            const movedRange = res[1];
            getChangedColumnsObj(
              entityColumnsObj,
              movedRange,
              afterColumnsArray
            ).then(updatedColumnOrders => {
              axios
                .put('/api/leads/columnorders', { updatedColumnOrders })
                .then(dispatch(getEntityColumnOrders));
            });
          });
      });
    }
  };
}
