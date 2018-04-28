import React from 'react';
import PropTypes from 'prop-types';

import './layout.scss';

import EscapeContext from '../../components/escape/escapeContext';

import FileManager from '../../components/modal/fileManager';

import Menu from '../menu';

export default class Layout extends React.Component {
    static propTypes = {
        showToast: PropTypes.func.isRequired,
        children: PropTypes.node.isRequired,
    };

    state = {
        fileManager: {
            isOpen: false,
        },
    };

    onOpenFileManager = () => {
        this.setState({
            fileManager: { isOpen: true },
        });
    };

    onCloseFileManager = () => {
        this.setState({
            fileManager: { isOpen: false },
        });
    };

    render() {
        return (
            <div className = 'layout'>
                { this.renderHeader() }
                { this.renderContent() }
                { this.renderFooter() }
                { this.renderFileManager() }
            </div>
        );
    }

    renderHeader() {
        return (
            <div className = 'layout__header'>
                <Menu onOpenFileManager = { this.onOpenFileManager } />
            </div>
        );
    }

    renderContent() {
        return (
            <div className = 'layout__content'>
                { this.props.children }
            </div>
        );
    }

    renderFooter() {
        return (
            <div className = 'layout__footer'>
                <span>
                    Back Office
                </span>
            </div>
        );
    }

    renderFileManager() {
        if (this.state.fileManager.isOpen) {
            return (
                <EscapeContext.Consumer>
                    { ({ addOnCloseHandler, removeOnCloseHandler }) => (
                        <FileManager
                            showToast = { this.props.showToast }
                            onClose = { this.onCloseFileManager }
                            addOnCloseHandler = { addOnCloseHandler }
                            removeOnCloseHandler = { removeOnCloseHandler } />
                    ) }
                </EscapeContext.Consumer>
            );
        }

        return null;
    }
}
