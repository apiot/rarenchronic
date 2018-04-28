import React from 'react';
import PropTypes from 'prop-types';

import './oneColumnPage.scss';

const OneColumPage = ({ children }) => (
    <div className = 'one-column-page'>
        { children }
    </div>
);

OneColumPage.propTypes = {
    children: PropTypes.node.isRequired,
};

export default OneColumPage;
