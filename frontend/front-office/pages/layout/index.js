import React from 'react';

import './layout.scss';

class Layout extends React.Component {
    render() {
        return (
            <div className = 'layout'>
                { this.renderHeader() }
                { this.props.children }
                { this.renderFooter() }
            </div>
        );
    }

    renderHeader() {
        return (
            <div>
            </div>
        );
    }

    renderFooter() {
        return (
            <div>
            </div>
        );
    }
}

export default Layout;
