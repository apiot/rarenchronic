import React from 'react';

import './loader.scss';

export default class Loader extends React.Component {
    render() {
        return (
            <div className = 'loader-box'>
                <span className = 'loader-box__label'>Chargement en cours</span>
                <div className = 'loader-box__spinner' />
            </div>
        );
    }
}
