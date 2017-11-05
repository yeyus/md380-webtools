import React from 'react';

import DeviceView from 'views/device-view';
import CodeplugView from 'views/codeplug-view';

export default [
    {
        path: '/',
        exact: true,
        main: () => <DeviceView />
    },
    {
        path: '/devices',
        exact: false,
        main: () => <DeviceView />
    },
    {
        path: '/codeplugs',
        exact: false,
        main: () => <CodeplugView />
    }
];
