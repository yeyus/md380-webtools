import React from 'react';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

const styles = {
    icon: {
        width: 48,
        height: 48,
        color: '#fff',
        fontSize: 48
    },
    wrapper: {
        width: 80,
        height: 80,
        padding: 5,
    },
    listElement: {
        width: '225px',
    },
    label: {
        fontSize: '1.3em',
        display: 'inline-block',
        verticalAlign: 'middle',
        height: '65px'
    }
};

const SidebarItem = (props) => (
    <li style={styles.listElement}>
        <IconButton
            iconClassName="material-icons"
            iconStyle={styles.icon}
            style={styles.wrapper}>
            { props.icon }
        </IconButton>
        <div style={styles.label}>{ props.label }</div>
    </li>
);

module.exports = SidebarItem;
