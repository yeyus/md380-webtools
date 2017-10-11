import USBService from 'services/usb';

export const fetchAttachedDevices = () => {
    return (dispatch, getState) => {
        USBService.requestAvailableMD380()
            .then(
                (devices) => {
                    devices.forEach(device =>                     dispatch(attachDeviceSuccess(device)));
                },
                (error) => {
                    dispatch(attachDeviceRejected(error));
                }
            );
    };
};
export const attachDeviceRequest = device => {
    return (dispatch, getState) => {
        dispatch({
            type: 'ATTACH_DEVICE_REQUEST'
        });

        USBService.requestMD380()
            .then(
                device => {
                    dispatch(attachDeviceSuccess(device));
                },
                error => {
                    dispatch(attachDeviceRejected(error));
                }
            );
    };
};

export const attachDeviceRejected = error => {
    return {
        type: 'ATTACH_DEVICE_REJECTED',
        error: error
    };
};

export const attachDeviceSuccess = device => {
    return {
        type: 'ATTACH_DEVICE_SUCCESS',
        device: device
    };
};

export const downloadCodeplugRequest = deviceId => {
    return (dispatch, getState) => {
        dispatch({
            type: 'DEVICE_DOWNLOAD_CODEPLUG_INIT',
            deviceId: deviceId
        });

        let device = getState().device.list[deviceId];

        let progressCallback = (device, progressBytes, totalBytes) => {
            dispatch({
                type: 'DEVICE_DOWNLOAD_CODEPLUG_PROGRESS',
                deviceId: deviceId,
                progressBytes: progressBytes,
                totalBytes: totalBytes
            });
        };

        USBService.downloadCodeplug(device, progressCallback)
            .then(
                codeplugData => {
                    dispatch({
                        type: 'DEVICE_DOWNLOAD_CODEPLUG_SUCCESS',
                        deviceId: deviceId,
                        date: new Date(),
                        data: codeplugData
                    });
                },
                e => {
                    dispatch({
                        type: 'DEVICE_DOWNLOAD_CODEPLUG_ERROR',
                        deviceId: deviceId,
                        error: e
                    });
                }
            );
    };
};

export const rebootRequest = deviceId => {
    return (dispatch, getState) => {
        let device = getState().device.list[deviceId];

        USBService.reboot(device);

        return {
            type: 'REBOOT_DEVICE_REQUEST',
            deviceId: deviceId
        };
    };
};
