const initialState = {
    isRequesting: false,
    isCancelled: false,
    isDownloading: false,
    downloadProgressBytes: 0,
    downloadTotalBytes: 0,
    error: null,
    list: [],
    codeplugs: []
};

const device = (state = initialState, action) => {

    // TODO debug
    console.log('action: ', action);

    switch (action.type) {
    case 'ATTACH_DEVICE_REQUEST':
        return {
            ...state,
            isRequesting: true,
            isCancelled: false,
            error: null
        };
    case 'ATTACH_DEVICE_REJECTED':
        return {
            ...state,
            isRequesting: false,
            isCancelled: true,
            error: action.error
        };
    case 'ATTACH_DEVICE_SUCCESS':
        return {
            ...state,
            isRequesting: false,
            isCancelled: false,
            error: null,
            list: state.list.concat(action.device)
        };
    case 'DEVICE_DOWNLOAD_CODEPLUG_INIT':
        return {
            ...state,
            isDownloading: true
        };
    case 'DEVICE_DOWNLOAD_CODEPLUG_PROGRESS':
        return {
            ...state,
            downloadProgressBytes: action.progressBytes,
            downloadTotalBytes: action.totalBytes
        };
    case 'DEVICE_DOWNLOAD_CODEPLUG_SUCCESS':
        return {
            ...state,
            codeplugs: state.codeplugs.concat({
                deviceId: action.deviceId,
                date: action.date,
                data: action.data
            }),
            isDownloading: false
        };
    case 'DEVICE_DOWNLOAD_CODEPLUG_ERROR':
        return {
            ...state,
            isDownloading: false,
            error: action.error
        };
    default:
        return state;
    }
};

export default device;
