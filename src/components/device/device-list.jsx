import React, { Component } from 'react';

import DeviceInfoCard from 'components/device/device-info-card';

export default class DeviceList extends Component {

    render() {
        let listElements = this.props.devices.map((device, index) => (
            <li key={device.serialNumber} >
                <DeviceInfoCard
                    device={device}
                    onDownloadClick={this.props.onDownloadClick.bind(this, index)}
                    onRebootClick={this.props.onRebootClick.bind(this, index)} />
            </li>
        ));
        let noElements = (
            <p>No Devices attached!</p>
        );

        return (
            <ul className="clean">
                { listElements }
                { (!this.props.devices || this.props.devices && this.props.devices.length === 0) && noElements }
            </ul>
        );
    }

};
