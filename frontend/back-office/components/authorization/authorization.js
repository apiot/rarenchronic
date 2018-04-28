import React from 'react';
import PropTypes from 'prop-types';

import { getAuthorization } from '../../api/accounts';

export default class Authorization extends React.Component {
    static propTypes = {
        children: PropTypes.func.isRequired,
    };

    state = {
        isAuthenticated: false,
        groups: [],
        permissions: [],
    };

    componentDidMount() {
        this._getAuthorization();
    }

    _getAuthorization = () => {
        getAuthorization()
            .then((response) => {
                const { data } = response;
                const { authenticated, groups, permissions } = data;
                this.setState({
                    isAuthenticated: authenticated,
                    groups,
                    permissions,
                });
            });
    }

    reloadAuthorization = () => {
        this._getAuthorization();
    };

    render() {
        return this.props.children(this.state, this.reloadAuthorization);
    }
}
