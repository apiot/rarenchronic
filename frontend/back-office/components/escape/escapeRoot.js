import React from 'react';
import PropTypes from 'prop-types';

export default class EscapeRoot extends React.Component {
    static propTypes = {
        children: PropTypes.func.isRequired,
    }

    state = {
        onCloseStack: [],
    };

    _addOnCloseHandler = (handler) => {
        this.setState({
            onCloseStack: [handler].concat(this.state.onCloseStack),
        });
    };

    _removeOnCloseHandler = (handler) => {
        const newStack = this.state.onCloseStack
            .filter(candidate => candidate !== handler);

        this.setState({
            onCloseStack: newStack,
        });
    };

    _handleKeydown = event => {
        if (isEscapeKey(event) && this.state.onCloseStack.length) {
            this.state.onCloseStack[0](event);
        }
    };

    componentDidMount() {
        document.addEventListener('keydown', this._handleKeydown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this._handleKeydown);
    }

    render() {
        const handlers = {
            addOnCloseHandler: this._addOnCloseHandler,
            removeOnCloseHandler: this._removeOnCloseHandler,
        };

        return this.props.children(handlers);
    }
}

function isEscapeKey(event) {
    return event.which === 27;
}
