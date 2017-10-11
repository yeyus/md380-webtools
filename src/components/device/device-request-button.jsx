import React, { Component } from 'react';
import { RaisedButton } from 'material-ui';

export default class DeviceRequestButton extends Component {
    render() {
        return <RaisedButton
                   disabled={this.props.disabled}
                   primary={true}
                   label="Connect MD380"
                   onClick={this.props.onClick} />
    }
}
