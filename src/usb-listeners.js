import { fetchAttachedDevices } from 'actions';

export default function(dispatch, getState) {
    navigator.usb.addEventListener('disconnect', device => {
        dispatch(fetchAttachedDevices());
    });

    navigator.usb.addEventListener('connect', device => {
        dispatch(fetchAttachedDevices());
    });
}
