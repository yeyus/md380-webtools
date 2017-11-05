import React from 'react';
import { connect } from 'react-redux';

class CodeplugView extends React.Component {

    render() {
        return (<h1>Codeplug View</h1>);
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        codeplugs: state.codeplug.list
    };
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {};
}

const CodeplugViewContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(CodeplugView);

export default CodeplugViewContainer;
