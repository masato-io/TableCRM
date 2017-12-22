import axios from 'axios';
import moment from 'moment';
import {
  getNewAndUpdatedRows,
  getRemovedIds,
  getSortedColumnsByRank,
  getMovedColumnsIndexRange,
  mapColumnIdToName,
  getUpdatedColumnsObj
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
    const getNewAndUpdatedRowsBound = getNewAndUpdatedRows.bind(this);
    const newAndUpdatedRows = getNewAndUpdatedRowsBound(changes, source);

    if (newAndUpdatedRows) {
      const newRows = newAndUpdatedRows.newRows;
      const updatedRows = newAndUpdatedRows.updatedRows;

      if (newRows.length > 0) {
        axios.post('/api/leads', { newRows }).then(() => {
          dispatch(getAllLeads);
        });
      }

      if (updatedRows.length > 0) {
        axios.put('/api/leads', { updatedRows }).then(() => {
          dispatch(getAllLeads);
        });
      }
    }
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

export function getColumnsOfLeads(dispatch) {
  axios
    .get('/api/leads/columns')
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

export function updateColumnsOfLeads(columns, target) {
  return function(dispatch) {
    if (target) {
      getMovedColumnsIndexRange(columns, target).then(movedRange => {
        const mapColumnIdToNameBind = mapColumnIdToName.bind(this);
        mapColumnIdToNameBind()
          .then(ColumnIdToNameObj => [ColumnIdToNameObj, movedRange])
          .then(resArray => {
            const ColumnIdToNameObj = resArray[0];
            const movedRangeIndexes = resArray[1];
            const afterColumnsArray = this.refs.hot.hotInstance.getColHeader();
            getUpdatedColumnsObj(
              ColumnIdToNameObj,
              movedRangeIndexes,
              afterColumnsArray
            ).then(updatedColumnOrders => {
              axios
                .put('/api/leads/columns', { updatedColumnOrders })
                .then(dispatch(getColumnsOfLeads));
            });
          });
      });
    }
  };
}

export function clickedDetailButton(event, coords, td) {
  return function(dispatch) {
    // get row data
    const rowIndex = coords.row;
    const rowData = this.refs.hot.hotInstance.getDataAtRow(rowIndex);
    const rowId = rowData[0];
    // change route with id
    this.props.history.push(`${this.props.match.url}/${rowId}`);
    // move right panel
    const rightPanel = document.getElementsByClassName('right_panel')[0];
    rightPanel.style.webkitTransform = 'translateX(-800px)';
    // get data
    dispatch(getLeadById(rowId));
  };
}

export function getLeadById(id) {
  return function(dispatch) {
    axios
      .get('/api/lead', { params: { id } })
      .then(response => {
        const returnedEntity = response.data[0];
        return returnedEntity;
      })
      .then(returnedEntity => {
        axios
          .get('/api/leads/columns')
          .then(response => {
            const columnOrder = response.data;
            const compare = (a, b) => {
              if (a.rank < b.rank) return -1;
              if (a.rank > b.rank) return 1;
              return 0;
            };
            columnOrder.sort(compare);
            return [columnOrder, returnedEntity];
          })
          .then(response => {
            const columnOrder = response[0];
            const returnedEntity = response[1];
            const rankedFields = [];
            for (const i of columnOrder) {
              const tempObj = {};
              tempObj[i.name] = returnedEntity[i.name];
              rankedFields.push(tempObj);
            }
            return rankedFields;
          })
          .then(rankedFields => {
            dispatch({
              type: 'GET_LEAD_BY_ID',
              payload: rankedFields
            });
          })
          .catch(err => {
            console.error.bind(err);
          });
      });
  };
}
