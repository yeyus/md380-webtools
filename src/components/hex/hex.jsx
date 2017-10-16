import React from 'react';

import HexLine from 'components/hex/hex-line';

export default class Hex extends React.Component {

    generateLines(blob, start, end, lineSize) {
        let lines = [];

        for (let i = start; i <= end; i += lineSize) {
            lines.push(<HexLine
                           key={i}
                           offset={i}
                           size= {lineSize}
                           data={ blob.slice(i, i + lineSize) }/>);
        }

        return lines;
    }

    render() {
        let sample = new Blob(['hello world!'], {
            type: 'text/plain'
        });

        let lines = this.generateLines(sample,
                                       this.props.start,
                                       this.props.end,
                                       this.props.lineSize);

        return (
            <ul>
                { lines }
            </ul>
        );
    }
}
