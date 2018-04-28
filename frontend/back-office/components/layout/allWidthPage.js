import React from 'react';
import PropTypes from 'prop-types';

import './allWidthPage.scss';

const AllWidthPage = ({ children }) => (
    <div className = 'all-width-page'>
        { children }
    </div>
);

AllWidthPage.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AllWidthPage;
