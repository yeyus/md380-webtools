import styles from 'style/hex.css';

import React from 'react';
import HexCell from 'components/hex/hex-cell';

function padHex(value) {
    let str = value.toString(16),
        pad = "00000000";
    return pad.substring(0, pad.length - str.length) + str;
}

async function blobToArrayBuffer(blob) {
	  var fileReader = new FileReader();

	  return new Promise(function(resolve, reject) {
		    fileReader.onloadend = resolve;
		    fileReader.onerror = reject;

		    fileReader.readAsArrayBuffer(blob);
	  });
};

export default class HexLine extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            data: null,
            hoverCellOffset: -1
        };
    }

    async componentDidMount() {
        let ab = await blobToArrayBuffer(this.props.data);
        let view = new DataView(ab.target.result);

        this.setState({
            data: view
        });
    }

    getEncodedCell(offset, encodingFn) {
        let { data } = this.state,
            { size } = this.props.size,
            cells = [];

        if (!data) {
            return cells;
        }

        for (let i = 0; i < this.props.size; i++) {
            cells.push(encodingFn.bind(this)(data, i, offset));
        }

        return cells;
    }


    asciiEncoding(data, i, offset) {
        try {
            return (
                <HexCell
                    key={offset + i}
                    offset={offset + i}
                    isHover={ this.props.hoverCellOffset === offset + i }
                    onCellEnter={this.props.onCellEnter}
                    text={String.fromCharCode(data.getUint8(i))} />
            );
        } catch(e) {
            return (
                <HexCell
                    key={offset + i}
                    offset={offset + i}
                    isHover={ this.props.hoverCellOffset === offset + i }
                    onCellEnter={this.props.onCellEnter}
                    text="." />
            );
        }
    }

    hexEncoding(data, i, offset) {
        try {
            return (
                <HexCell
                    key={offset + i}
                    offset={offset + i}
                    className={ styles['cell-type-hex'] }
                    isHover={ this.props.hoverCellOffset === offset + i }
                    onCellEnter={this.props.onCellEnter}
                    text={data.getUint8(i).toString(16)} />
            );
        } catch (e) {
            return (
                <HexCell
                    key={offset + i}
                    offset={offset + i}
                    className={ styles['cell-type-hex'] }
                    isHover={ this.props.hoverCellOffset === offset + i }
                    onCellEnter={this.props.onCellEnter}
                    text="--" />
            );
        }
    }

    render() {
        let offset = padHex(this.props.offset),
            size = this.props.size,
            hexContents = this.getEncodedCell(this.props.offset, this.hexEncoding),
            asciiContents = this.getEncodedCell(this.props.offset, this.asciiEncoding);

        return (
            <li className={styles.line}>
                <code className={styles.contents}>
                    {offset} <span>{hexContents}</span> <span>{asciiContents}</span>
                </code>
            </li>
        );
    }
}
