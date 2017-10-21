import styles from 'style/hex.css';

import React from 'react';

import HexLine from 'components/hex/hex-line';

export default class Hex extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            hoverCellOffset: -1
        };
    }

    onCellEnter(offset) {
        this.setState({
            hoverCellOffset: offset
        });
    }

    generateLines(blob, start, end, lineSize) {
        let lines = [];

        for (let i = start; i <= end; i += lineSize) {
            lines.push(<HexLine
                           key={i}
                           offset={i}
                           size={lineSize}
                           data={ blob.slice(i, i + lineSize) }
                           hoverCellOffset={this.state.hoverCellOffset}
                           onCellEnter={this.onCellEnter.bind(this)} />);
        }

        return lines;
    }

    render() {
        let lines = this.generateLines(this.props.blob,
                                       this.props.start,
                                       this.props.end,
                                       this.props.lineSize);

        return (
            <ul className={styles.wrapper} >
                { lines }
            </ul>
        );
    }
}
