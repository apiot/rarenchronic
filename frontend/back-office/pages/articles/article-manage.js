import React from 'react';
import PropTypes from 'prop-types';

import './articles.scss';

export default class ArticleManage extends React.Component {
    static propTypes = {
        match: PropTypes.object,
        showToast: PropTypes.func.isRequired,
    };

    render() {
        return (
            <div className = 'article-manage'>

            </div>
        );
    }
}
