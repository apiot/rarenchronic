import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import './article-line.scss';

import {
    ARTICLE_STATUS,
    ARTICLE_STATUS_LABELS,
    ARTICLE_PUBLIC,
    ARTICLE_PUBLIC_LABELS,
    COMMENTS_LABELS,
} from '../../consts/articles';

export default class ArticleLine extends React.Component {
    static propTypes = {
        showToast: PropTypes.func.isRequired,
        article: PropTypes.object.isRequired,
    };

    render() {
        const { id, author, authorName, status, img, title } = this.props.article;
        const { content, comments_opened, created, start, end  } = this.props.article;
        const { updated_by, updated, deleted } = this.props.article;
        const publicStatus = this.props.article.public
            ? ARTICLE_PUBLIC_LABELS.PUBLIC
            : ARTICLE_PUBLIC_LABELS.NOT_PUBLIC;

        const createdAt = moment(created).format('DD/MM/YYYY HH:mm:ss');
        const commentStatus = comments_opened ? COMMENTS_LABELS.OPENED : COMMENTS_LABELS.CLOSED;

        return (
            <div className = 'article-line'>
                <div className = 'article-line__one-line article-line__strict-line'>
                    <span className = 'article-line__meta'
                        title = 'Identifiant'>
                        { `${id} | ` }
                    </span>
                    <span className = 'article-line__title'
                        title = 'Titre de l’article'>
                        { title }
                    </span>
                </div>
                <div className = 'article-line__one-line article-line__strict-line'>
                    <span className = 'article-line__meta'
                        title = 'Date de création'>
                        { `Créé le ${createdAt} par ${authorName} | ` }
                    </span>
                    <span className = 'article-line__meta'
                        title = 'Statut de l’article'>
                        { `Statut\u00A0: ${ARTICLE_STATUS_LABELS[status]} | ` }
                    </span>
                    <span className = 'article-line__meta'
                        title = 'Ouverture des commentaires'>
                        { `Commentaires\u00A0: ${commentStatus} | ` }
                    </span>
                    <span className = 'article-line__meta'
                        title = 'Visbilité de l’article'>
                        { `Visibilité\u00A0: ${publicStatus}` }
                    </span>
                </div>
                { this.renderCategories() }
                { this.renderTags() }
                <div className = 'article-line__commands'>
                    <i title = 'Voir dans le site public' className = 'fas fa-eye icon-button'/>
                    <i title = 'Éditer' className = 'fas fa-edit icon-button'/>
                    <i title = 'Supprimer' className = 'fas fa-trash-alt icon-button'/>
                </div>
            </div>
        );
    }

    renderCategories() {
        const { categories } = this.props.article;

        if (categories && categories.length > 0) {
            const displayCategories = categories.map(category => <span>
                { ` ${category}` }
            </span>);

            return (
                <div className = 'article-line__one-line'>
                    <span className = 'article-line__meta'>
                    { `Catégories\u00A0:${displayCategories}` }
                    </span>
                </div>
            );
        }

        return null;
    }

    renderTags() {
        const { tags } = this.props.article;

        if (tags && tags.length > 0) {
            const displayTags = tags.map(tag => <span>
                { ` ${tag}` }
            </span>);

            return (
                <div className = 'article-line__one-line'>
                    <span className = 'article-line__meta'>
                        { `Tags\u00A0:${displayTags}` }
                    </span>
                </div>
            );
        }

        return null;
    }
}
