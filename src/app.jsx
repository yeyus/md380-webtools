import * as styles from './style/index.css';

import React from 'react';

import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Sidebar from 'components/sidebar';
import AppBar from 'material-ui/AppBar';

import routes from 'configs/routes';

export default class App extends React.Component {
    render() {
        return (
            <Router>
                <MuiThemeProvider>
                    <div className="app">
                        <Sidebar />
                        <div className={styles.content}>
                            <AppBar title="MD380/380(G) web tool" />
                            {
                                routes.map((route, index) => (
                                    <Route
                                      key={ index }
                                      path={ route.path }
                                      exact={ route.exact }
                                      component={ route.main } />
                                ))
                            }
                        </div>
                    </div>
                </MuiThemeProvider>
            </Router>
        );
    }
}
