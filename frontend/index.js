import React from 'react';
import { render } from 'react-dom';
import { HashRouter, Route, Switch } from 'react-router-dom';

import FrontOffice from './front-office/router';
import BackOffice from './back-office/router';

render (
    <HashRouter>
        <Switch>
            <Route path = '/back-office' component = { BackOffice } />
            <Route path = '/' component = { FrontOffice } />
        </Switch>
    </HashRouter>,
    document.querySelector('#app')
);
