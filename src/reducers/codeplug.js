const initialState = {
    list: []
};

/*
 codeplug definition:
 {
   id: <uuid>,
   source: 'RADIO' | 'FILE' | 'GDRIVE' ...,
   format: 'MD380DFU' | 'MD380RDT' ...,
   deviceId: <radioId>,
   date: <creation date>,
   data: <Blob>
 }
 */

const codeplug = (state = initialState, action) => {
    switch(action.type) {
    case 'CODEPLUG_ADD':
        return {
            ...state,
            list: state.list.concat(action.codeplug)
        };
    case 'CODEPLUG_REMOVE':
        return {
            ...state,
            list: state.list.splice(action.index, 1)
        };
    default:
        return state;
    }
};

export default codeplug;
