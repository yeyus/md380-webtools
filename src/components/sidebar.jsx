import * as cssStyles from 'style/index.css';

import React from 'react';
import SidebarItem from 'components/sidebar-item';

import routes from 'configs/routes';

const items = routes.filter((route) => route.label === 'Devices' || route.label === 'Codeplugs' || route.label === 'UsersDB');

const Sidebar = (props) => {
    let itemsHtml = items.map((item, idx) => (
        <SidebarItem
            key={idx}
            icon={item.icon}
            label={item.label}
            path={item.path} />
    ));

    return (
        <div className={cssStyles.sidebar}>
            <ul className={cssStyles.clean}>
                { itemsHtml }
            </ul>
        </div>
    );
};

module.exports = Sidebar;
