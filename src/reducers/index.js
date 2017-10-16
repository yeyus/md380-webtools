import { combineReducers } from 'redux';
import device from 'reducers/device';
import codeplug from 'reducers/codeplug';

const md380reducers = combineReducers({
    device,
    codeplug
});

export default md380reducers;
