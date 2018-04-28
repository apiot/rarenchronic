import React from 'react';
import PropTypes from 'prop-types';

import './toggleSwitch.scss';

const ToggleSwitch = ({ value, onChange }) => (
    <div className = 'toggle-switch'>
        <input className = 'toggle-switch__input'
            type = 'checkbox'
            checked = { value }
            onChange = { onChange } />
        <span className = 'toggle-switch__slider toggle-switch__round' />
    </div>
);

ToggleSwitch.propTypes = {
    value: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default ToggleSwitch;
