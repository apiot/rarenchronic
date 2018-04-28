import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactTooltip from 'react-tooltip'
import ReactTextArea from 'react-textarea-autosize';
import Select from 'react-select';
import Creatable from 'react-select/lib/Creatable';

import './article-form.scss';

import AuthorizationContext from '../authorization/authorizationContext';
import ServiceMessage from '../serviceMessage/serviceMessage';
import { errorHandler } from '../../utils/handlers';

import {
    getArticleCategoriesByUser,
} from '../../api/articles';

import {
    ARTICLE_STATUS,
    ARTICLE_STATUS_LABELS,
    COMMENTS_STATUS,
    COMMENTS_STATUS_LABELS,
} from '../../consts/articles';

export default class ArticleForm extends React.Component {
    static propTypes = {
        showToast: PropTypes.func.isRequired,
    };

    state = {
        status: ARTICLE_STATUS.UNSAVED,
        image: null,
        from: moment.now(),
        to: null,
        categories: [],
        categoriesOptions: [],
        tags: [],
        title: '',
        content: '',
        commentsOpened: true,
        isPublic: true,
    };

    componentDidMount() {
        getArticleCategoriesByUser()
            .then((axiosResponse) => {
                const categories = axiosResponse.data;
                this.setState({ categoriesOptions: categories });
            })
            .catch(errorHandler(this.props.showToast));
    }

    _onChangeStatus  = (option) => {
        if (option) {
            this.setState({ status: option.value });
        }
    };

    _onChangeCategory = (options) => {
        this.setState({ categories: options.map(opt => opt.value) });
    };

    _onChangeTitle = (event) => {
        this.setState({ title: event.target.value });
    };

    _handleCmd = (event, commandName, defaultUI = false, valueArg = '') => {
        const execCmds = new Set([
            'justifyFull',
            'justifyCenter',
            'justifyLeft',
            'justifyRight',
            'indent',
            'outdent',
            'bold',
            'italic',
            'underline',
            'hiliteColor',
            'decreaseFontSize',
            'increaseFontSize',
            'subscript',
            'superscript',
            'strikeThrough',
            'insertUnorderedList',
            'insertOrderedList',
            '',
            '',
            '',
            'createLink',
            'heading',
            '',
        ]);
        execCmds.forEach((cmd) => {
            if (!document.queryCommandSupported(cmd)) {
                console.log(`Command: ${cmd} is not supported.`);
            };
        });

        if (execCmds.has(commandName)) {
            console.log(commandName);
            document.execCommand(commandName, defaultUI, valueArg);
        } else {
            console.log('an error has occured !');
        }

        event.preventDefault();
    };

    render() {
        return (
            <AuthorizationContext.Consumer>
                { (authContext) => this.renderContent(authContext) }
            </AuthorizationContext.Consumer>
        );
    }

    renderContent(authContext) {
        if (authContext && authContext.isAuthenticated) {
            return this.renderPage();
        } else {
            return <ServiceMessage message = { `Vous devez être connecté\u00B7e pour accéder à cette page.` } />;
        }
    }

    renderPage() {
        return (
            <div className = 'article-form'>
                { this.articleMeta() }
                { this.textCommands() }
                { this.mainForm() }
                <ReactTooltip />
            </div>
        );
    }

    articleMeta() {
        const { categories, categoriesOptions, status } = this.state;
        return (
            <div className = 'article-form__meta'>
                <div>
                    Publication :
                    <Select className = 'article-form__meta__select-box'
                        placeholder = 'Statut'
                        value = { { value: status, label: ARTICLE_STATUS_LABELS[status] } }
                        onChange = { this._onChangeStatus }
                        options = { Object.values(ARTICLE_STATUS).map((st) => {
                           return { value: st, label: ARTICLE_STATUS_LABELS[st] };
                        }) } />
                </div>
                <div>
                    Catégorie :
                    <Creatable className = 'article-form__meta__select-box'
                        placeholder = 'Catégories'
                        value = { categories.map(cat => ({ value: cat, label: cat })) }
                        multi = { true }
                        onChange = { this._onChangeCategory }
                        options = { categoriesOptions.map((cat) => {
                           return { value: cat, label: cat };
                        }) } />
                </div>
                <div>
                    Tags :
                    <form>

                    </form>
                </div>
                <div>
                    Ouvrir les commentaires :
                    <form>

                    </form>
                </div>
                <div>
                    Article public :
                    <form>

                    </form>
                </div>
            </div>
        );
    }

    textCommands() {
        return (
            <div className = 'article-form__commands'>
                { this.oneCmd('justifyFull', 'Justifier le texte', 'fas fa-align-justify') }
                { this.oneCmd('justifyCenter', 'Centrer le texte', 'fas fa-align-center') }
                { this.oneCmd('justifyLeft', 'Mettre à gauche', 'fas fa-align-left') }
                { this.oneCmd('justifyRight', 'Mettre à droite', 'fas fa-align-right') }
                { this.oneCmd('indent', 'Indenter le texte', 'fas fa-indent') }
                { this.oneCmd('outdent', 'Indenter le texte depuis la fin', 'fas fa-outdent') }
                { this.oneCmd('bold', 'Texte en gras', 'fas fa-bold') }
                { this.oneCmd('italic', 'Texte en italic', 'fas fa-italic') }
                { this.oneCmd('underline', 'Texte souligné', 'fas fa-underline') }
                { this.oneCmd('hiliteColor', 'Texte surligné', 'fas fa-highlighter', 'ffff66') }
                { this.oneCmd('decreaseFontSize', 'Diminuer la taille du texte', 'fas fa-search-minus') }
                { this.oneCmd('increaseFontSize', 'Augmenter la taille du texte', 'fas fa-search-plus') }
                { this.oneCmd('subscript', 'Texte en indice', 'fas fa-subscript') }
                { this.oneCmd('superscript', 'Texte en exposant', 'fas fa-superscript') }
                { this.oneCmd('strikeThrough', 'Texte barré', 'fas fa-strikethrough') }
                { this.oneCmd('insertUnorderedList', 'Liste non ordonnée', 'fas fa-list-ul') }
                { this.oneCmd('insertOrderedList', 'Liste ordonnée', 'fas fa-list-ol') }
                { this.oneCmd('', 'Citer', 'fas fa-quote-right') }
                { this.oneCmd('', 'Bloc de code', 'fas fa-code') }
                { this.oneCmd('', 'Bloc de texte', 'fas fa-square') }
                { this.oneCmd('createLink', 'Ajouter un lien', 'fas fa-link') }
                { this.oneCmd('heading', 'Ajouter un titre', 'fas fa-heading') }
                { this.oneCmd('', 'Ajouter une vidéo Youtube', 'fab fa-youtube') }
            </div>
        );
    }

    oneCmd(cmd, tip, icon, arg = '') {
        const defaultUI = false;
        return (
            <span
                onMouseDown = { (event) => this._handleCmd(event, cmd, defaultUI, arg) }
                data-tip = { tip } >
                <i className = { icon } />
            </span>
        );
    }

    mainForm() {
        const placeholderStyle = 'article-form__main-form__placeholder';
        const { title, content } = this.state;
        const titleBoxClass = title
            ? 'article-form__main-form__title-box'
            : `article-form__main-form__title-box ${placeholderStyle}`;
        const contentBoxClass = content
            ? 'article-form__main-form__text-box'
            : `article-form__main-form__text-box ${placeholderStyle}`;

        return (
            <div className = 'article-form__main-form'>
                <ReactTextArea className = { titleBoxClass }
                    placeholder = 'Titre'
                    value = { title }
                    onChange = { this._onChangeTitle } />
                <div className = { contentBoxClass }
                    contentEditable = { true }
                    id = 'article-form-content'
                    datatext = 'Contenu de l’article'
                    />
            </div>
        );
    }
}
