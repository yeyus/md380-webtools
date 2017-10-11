import * as styles from './style/index.css';

import React from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Sidebar from 'components/sidebar';
import AppBar from 'material-ui/AppBar';
import DeviceView from 'views/device-view';

export default class App extends React.Component {
    render() {
        return (
            <MuiThemeProvider>
                <div className="app">
                    <Sidebar />
                    <div className={styles.content}>
                        <AppBar title="MD380/380(G) web tool" />
                        <DeviceView />
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}
