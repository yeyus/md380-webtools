import styles from 'style/hex.css';

import React from  'react';
import classnames from 'classnames';

export default class HexCell extends React.Component {

    onCellEnter() {
        this.props.onCellEnter &&
        this.props.onCellEnter(this.props.offset);
    }

    onCellLeave() {
        this.props.onCellLeave &&
        this.props.onCellLeave(this.props.offset);
    }

    render() {
        const spanClasses = classnames([
            styles.cell,
            this.props.isHover && styles.cellHover,
            this.props.isSelected && styles.cellSelected,
            this.props.className
        ]);

        return (
            <span
                className={spanClasses}
                onMouseEnter={this.onCellEnter.bind(this)}
                onMouseLeave={this.onCellLeave.bind(this)}>
                {this.props.text}
            </span>
        );
    }
}
