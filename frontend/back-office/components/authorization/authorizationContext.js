import React from 'react';

const defaultValues = {
    isAuthenticated: false,
    groups: [],
    permissions: [],
};

const AuthorizationContext = React.createContext(defaultValues);

export default AuthorizationContext;
