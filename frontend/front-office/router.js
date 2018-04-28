import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';

import Layout from './pages/layout';
import Home from './pages/home';
import Profile from './pages/profile';

class Router extends React.Component {
    render() {
        return (
            <Layout>
                { this.renderRouter() }
            </Layout>
        );
    }

    renderRouter() {
        return (
            <HashRouter>
                <Switch>
                    <Route exact path = '/profile' component = { Profile } />
                    <Route exact path = '/' component = { Home } />
                </Switch>
            </HashRouter>
        );
    }
}

export default Router;
