import styles from 'style/hex.css';

import React from 'react';

import HexLine from 'components/hex/hex-line';
import DownloadButton from 'components/hex/download-button.jsx';

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
        const { blob, fileName, start, end, lineSize } = this.props;
        let lines = this.generateLines(blob,
                                       start,
                                       end,
                                       lineSize);

        return (
            <div className={ styles.hexEditor }>
                <div className={ styles.hexEditorTopBar }>
                    <div className={ styles.hexEditorFileActions }>
                        <DownloadButton
                            blob={blob}
                            fileName={fileName} />
                    </div>
                    <div className={ styles.hexEditorFileInfo }>
                        239892 bytes
                    </div>
                </div>

                <ul className={styles.wrapper} >
                    { lines }
                </ul>
            </div>
        );
    }
}
