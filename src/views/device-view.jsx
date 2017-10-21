import React from 'react';
import { connect } from 'react-redux';

import {
    fetchAttachedDevices,
    attachDeviceRequest,
    downloadCodeplugRequest,
    rebootRequest
} from 'actions';

import DeviceList from 'components/device/device-list';
import DeviceRequestButton from 'components/device/device-request-button';
import DeviceTransferDialog from 'components/device/device-transfer-dialog';

// TODO remove me
import Hex from 'components/hex/hex';

class DeviceView extends React.Component {
    componentDidMount() {
        this.props.onInit();
    }

    acknowledgeTrasnfer() {
        console.log('TODO');
    }

    render() {
        const sample = new Blob(['hello world! la vida pirata es la vida mejor #$%^&*'], {
            type: 'text/plain'
        });

        return (
            <div className="device-view">
                <DeviceTransferDialog
                    isTransferDone= { !this.props.isDownloading }
                    onDoneClick={ this.acknowledgeTransfer }
                    isOpen={ this.props.isDownloading }
                    progress={ this.props.downloadProgressBytes}
                    total={ this.props.downloadTotalBytes} />
                <DeviceList
                    devices={ this.props.devices }
                    onDownloadClick={ this.props.onDeviceDownloadClick }
                    onRebootClick= { this.props.onDeviceRebootClick } />
                <DeviceRequestButton
                    disabled={ this.props.devices.length > 0 }
                    onClick={ this.props.onDeviceRequestClick }/>
                <Hex
                    blob={sample}
                    start={0}
                    end={sample.size}
                    lineSize={16}/>
            </div>
        );
    }
};

const mapStateToProps = (state, ownProps) => {
    return {
        devices: state.device.list,
        isDownloading: state.device.isDownloading,
        downloadProgressBytes: state.device.downloadProgressBytes,
        downloadTotalBytes: state.device.downloadTotalBytes
    };
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onInit: () => {
            dispatch(fetchAttachedDevices());
        },
        onDeviceRequestClick: () => {
            dispatch(attachDeviceRequest());
        },
        onDeviceDownloadClick: id => {
            dispatch(downloadCodeplugRequest(id));
        },
        onDeviceRebootClick: id => {
            dispatch(rebootRequest(id));
        }
    };
}

const DeviceViewContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(DeviceView)

export default DeviceViewContainer;
