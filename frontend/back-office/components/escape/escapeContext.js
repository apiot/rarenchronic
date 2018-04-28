import React from 'react';
import PropTypes from 'prop-types';

const defaultValues = {
    addOnCloseHandler: () => {},
    removeOnCloseHandler: () => {},
};

const EscapeContext = React.createContext(defaultValues);

export default EscapeContext;
