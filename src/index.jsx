import './style/index.css';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';
import md380reducers from './reducers'

import usbListeners from './usb-listeners';
import AppContainer from 'app';

let store = createStore(
    md380reducers,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunk)
);

usbListeners(store.dispatch, store.getState);

const App = () => (
    <Provider store={store} >
        <AppContainer />
    </Provider>
);

render(<App/>, document.getElementById('app'));

