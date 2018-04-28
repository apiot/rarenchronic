import React from 'react';

import './notFound.scss';

export default class NotFound extends React.Component {
    render() {
        return (
            <div className = 'not-found'>
                La page demandée n’existe pas.
            </div>
        );
    }
}
