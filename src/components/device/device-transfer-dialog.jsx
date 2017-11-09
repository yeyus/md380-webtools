import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';

export default class DeviceTransferDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = { open: false };
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.isOpen && nextProps.isOpen) {
            this.handleOpen();
        }
    };

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    render() {
        const actions = [
            <FlatButton
                label="Done"
                primary={true}
                disabled={!this.props.isTransferDone}
                onClick={this.handleClose}
            />
        ];

        return (
            <Dialog
                title="Codeplug Download"
                actions={actions}
                modal={true}
                open={this.state.open}>
                <p>Your codeplug is being download to your computer. Please wait!</p>
                <LinearProgress
                    mode="determinate"
                    value={this.props.progress}
                    min={0}
                    max={this.props.total} />
                <div>{ `${this.props.progress} out of ${this.props.total} bytes`}</div>
            </Dialog>
        );
    }
}
