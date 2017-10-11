import * as cssStyles from 'style/index.css';

import React from 'react';
import SidebarItem from 'components/sidebar-item';

const items = [
    {
        icon: 'usb',
        label: 'Devices'
    },
    {
        icon: 'layers',
        label: 'Codeplugs'
    },
    {
        icon: 'public',
        label: 'UsersDB'
    }
];

const Sidebar = (props) => {
    let itemsHtml = items.map((item, idx) => (
        <SidebarItem
            key={idx}
            icon={item.icon}
            label={item.label} />
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
