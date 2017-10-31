import React from 'react';

import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

import classNames from 'classnames';

const styles = {
    icon: {
        width: 20,
        height: 20,
        fontSize: 20,
        color: '#586069',
        iconHoverColor: '#0366d6'
    },
    wrapper: {
        width: 24,
        height: 24,
        padding: 2
    }
};

export default class DownloadButton extends React.Component {

    download() {
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";

        ((fileName, blob) => {
            let url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName || 'hex-file.bin';
            a.click();
            window.URL.revokeObjectURL(url);
        })(this.props.fileName, this.props.blob);
    }

    render() {
        return (
            <IconButton
                iconClassName={ classNames('material-icons') }
                iconStyle= { styles.icon }
                style= { styles.wrapper }
                onClick={ this.download.bind(this) }>
                file_download
            </IconButton>
        );
    }
}
