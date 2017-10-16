import uuid from 'uuid/v4';

export const addCodeplug = (codeplug) => {
    return {
        type: 'CODEPLUG_ADD',
        codeplug: {
            id: uuid(),
            ...codeplug
        }
    };
};

export const removeCodeplug = (index) => {
    return {
        type: 'CODEPLUG_REMOVE',
        index: index
    };
};
