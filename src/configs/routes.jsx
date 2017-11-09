import React from 'react';

import DeviceView from 'views/device-view';
import CodeplugView from 'views/codeplug-view';

export default [
    {
        path: '/',
        exact: true,
        label: 'Index',
        main: () => <DeviceView />
    },
    {
        path: '/device',
        exact: false,
        label: 'Devices',
        icon: 'usb',
        main: () => <DeviceView />
    },
    {
        path: '/codeplug',
        exact: false,
        label: 'Codeplugs',
        icon: 'layers',
        main: () => <CodeplugView />
    },
    {
        path: '/usersdb',
        exact: false,
        label: 'UsersDB',
        icon: 'public',
        main: () => null
    }
];
