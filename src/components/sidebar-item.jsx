import * as sidebarStyles from 'style/sidebar.css';

import React from 'react';
import { withRouter, NavLink } from 'react-router-dom';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

import classNames from 'classnames';

const baseIcon = {
    width: 48,
    height: 48,
    fontSize: 48
};

const styles = {
    icon: {
        ...baseIcon,
        color: '#fff',
        iconHoverColor: '#999',
    },
    selectedIcon: {
        ...baseIcon,
        color: '#03A9F4',
        iconHoverColor: ''
    },
    wrapper: {
        width: 80,
        height: 80,
        padding: 5,
    },
    label: {
        fontSize: '1.3em',
        display: 'inline-block',
        verticalAlign: 'middle',
        height: '65px'
    }
};

const SidebarItem = (props) => {
    return (
        <li className={ sidebarStyles.item }>
            <IconButton
                iconClassName={ classNames('material-icons') }
                iconStyle={ props.location.pathname.indexOf(props.path) === 0 ?
                                styles.selectedIcon : styles.icon }
                style={ styles.wrapper }>
                { props.icon }
            </IconButton>
            <div
                className={ sidebarStyles.label }>
                <NavLink
                    activeClassName={ sidebarStyles.activeLink }
                    to={ props.path }>
                    { props.label }
                </NavLink>
            </div>
        </li>
    );
};


module.exports = withRouter(SidebarItem);
