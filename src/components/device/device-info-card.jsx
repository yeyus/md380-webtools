import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import { FlatButton } from 'material-ui';

const DeviceInfoCard = (props) => (
    <Card>
        <CardHeader
            title={props.device.productName}
            subtitle={`Serial No: ${props.device.serialNumber}`}
            actAsExpander={true}
            showExpandableButton={true} />
        <CardActions>
            <FlatButton
                label="Reboot"
                onClick={props.onRebootClick} />
            <FlatButton
                label="Download Codeplug"
                onClick={props.onDownloadClick} />
        </CardActions>
        <CardText expandable={true}>
            Test!
        </CardText>
    </Card>
);

export default DeviceInfoCard;
