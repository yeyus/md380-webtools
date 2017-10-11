import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';

export default class DeviceTransferDialog extends React.Component {
    render() {
        const actions = [
            <FlatButton
                label="Done"
                primary={true}
                disabled={this.props.isTransferDone}
                onClick={this.props.onDoneClick}
            />
        ];

        return (
            <Dialog
                title="Codeplug Download"
                actions={actions}
                modal={true}
                open={this.props.isOpen}>
                <p>Your codeplug is being download to your computer. Please wait!</p>
                <LinearProgress
                    mode="determinate"
                    value={this.props.progress}
                    min={0}
                    max={this.props.total} />
            </Dialog>
        );
    }
}
