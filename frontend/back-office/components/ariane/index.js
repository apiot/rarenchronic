import React from 'react';
import PropTypes from 'prop-types';

import './ariane.scss';

const Ariane = ({ steps }) => {
    const allSteps = steps.map((step, index) => (
        <React.Fragment key = { index } >
            <i className = 'fas fa-arrow-right ariane__right-arrow' />
            <span>{ step }</span>
        </React.Fragment>
    ));

    return (
        <div className = 'ariane blueText'>
            <span>Back-office</span>
            { allSteps }
        </div>
    );
};

Ariane.propTypes = {
    steps: PropTypes.array.isRequired,
};

export default Ariane;
