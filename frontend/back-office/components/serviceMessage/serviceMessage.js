import React from 'react';
import PropTypes from 'prop-types';

import './serviceMessage.scss';

export default class ServiceMessage extends React.Component {
    static defaultProps = {
        type: 'default',
    };

    static propTypes = {
        message: PropTypes.string.isRequired,
        type: PropTypes.string,
    };

    render() {
        return (
            <div className = 'service-message'>
                <span className = 'service-message__message'>
                    { this.props.message }
                </span>
            </div>
        );
    }
}
