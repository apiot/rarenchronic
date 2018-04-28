import React from 'react';
import PropTypes from 'prop-types';

import './block.scss';

const Block = ({ title, children }) => (
    <div className = 'default-block'>
        <h1 className = 'default-block__title'>
            { title }
        </h1>
        <div className = 'default-block__content'>
            { children }
        </div>
    </div>
);

Block.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default Block;
