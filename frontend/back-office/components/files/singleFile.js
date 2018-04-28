import React from 'react';
import PropTypes from 'prop-types';
import Creatable from 'react-select/lib/Creatable';
import moment from 'moment';

import 'react-select/dist/react-select.css';

import _ from 'lodash';

import './singleFile.scss';

import * as API from '../../api/files';

import ToggleSwitch from '../../components/forms/toggleSwitch';

import { IMAGE_MIMES } from '../../consts/files';

import { errorHandler } from '../../utils/handlers';

export default class SingleFile extends React.Component {
    static propTypes = {
        showToast: PropTypes.func.isRequired,
        file: PropTypes.object.isRequired,
        reloadFiles: PropTypes.func.isRequired,
        reloadOneFile: PropTypes.func.isRequired,
        categories: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);

        const category = _.get(props.file, 'category');

        this.state = {
            name: {
                editable: false,
                value: this.props.file.name || 'Sans nom',
            },
            category: {
                editable: false,
                value: category ? { value: category, label: category } : null,
            },
            isPublic: this.props.file.is_public,
            preDelete: false,
        };
    }

    _resetState = () => {
        const { name, category } = this.state;
        this.setState({
            name: Object.assign({}, name, { editable: false }),
            category: Object.assign({}, category, { editable: false }),
            preDelete: false,
        });
    };

    _onPreDelete = () => {
        this.setState({ preDelete: true });
    };

    _onDeleteFile = () => API.deleteFile(this.props.file.id)
        .then(() => this.props.reloadFiles())
        .catch(errorHandler(this.props.showToast));

    _onCategoryEditable = () => {
        this.setState({
            category: Object.assign({}, this.state.category, { editable: true }),
            name: Object.assign({}, this.state.name, { editable: false }),
        });
    };

    _onSelectCategory = (option) => {
        const category = _.get(option, 'value', null);

        if (!category) {
            this.setState({
                category: Object.assign({}, this.state.category, {
                    value: null,
                }),
            });
        } else {
            this._onSubmitCategory(category);
        }
    };

    _onSubmitCategory = (category) => {
        API.updateFileCategory(this.props.file.id, category)
            .then(() => {
                this.props.showToast('Catégorie du fichier mise à jour.', 'success');
                this.props.reloadOneFile(this.props.file.id);
                this.setState({
                    category: Object.assign({}, this.state.category, {
                        value: category,
                        editable: false,
                    }),
                });
            })
            .catch(errorHandler(this.props.showToast));
    };

    _onSwitchIsPublic = (event) => {
        const isPublic = !this.state.isPublic;
        API.updateFileIsPublic(this.props.file.id, isPublic)
            .then(() => {
                this.props.showToast('Statut public du fichier mis à jour.', 'success');
                this.setState({ isPublic });
            })
            .catch(errorHandler(this.props.showToast));
    };

    _onNameEditable = () => {
        this.setState({
            category: Object.assign({}, this.state.category, { editable: false, }),
            name: Object.assign({}, this.state.name, { editable: true }),
        });
    };

    _onChangeName = (event) => {
        const value = event.target.value;

        this.setState({
            name: Object.assign({}, this.state.name, { value }),
        });
    };

    _onSubmitName = (event) => {
        event.preventDefault();

        API.updateFileName(this.props.file.id, this.state.name.value.trim())
            .then(() => {
                this.props.showToast('Nom du fichier modifié.', 'success');
                this.props.reloadOneFile(this.props.file.id);
                this.setState({
                    name: Object.assign({}, this.state.name, { editable: false}),
                });
            })
            .catch(errorHandler(this.props.showToast));
    };

    render() {
        const { type, url } = this.props.file;
        const isImage = IMAGE_MIMES.includes(this.props.file.type);

        const item = isImage
            ? <img className = 'single-file__image'
                src = { `${location.origin}/${url}` }
                alt = { name } />
            : <span>toto</span>;

        return (
            <div className = 'single-file'>
                <div className = 'single-file__overlay'
                    onMouseLeave = { this._resetState } >
                    { this.renderName() }
                    { this.renderCategory() }
                    { this.renderIsPublic() }
                    { this.renderDelete()  }
                    { this.renderFileInfo() }
                </div>
                { item }
            </div>
        );
    }

    renderName() {
        const { value, editable } = this.state.name;

        if (editable) {
            return (
                <div className = 'single-file__overlay__name-edit' >
                    <form onSubmit = { this._onSubmitName } >
                        <input
                            type = 'text'
                            value = { value }
                            onChange = { this._onChangeName }
                            />
                    </form>
                </div>
            );
        } else {
            return (
                <div className = 'single-file__overlay__name'
                    onClick = { this._onNameEditable } >
                    { this.props.file.name || 'Sans nom' }
                </div>
            );
        }
    }

    renderCategory() {
        if (this.state.category.editable) {
            const options = this.props.categories.map(cat => ({
                label: cat,
                value: cat,
            }));

            return (
                <div className = 'single-file__overlay__category'>
                    <Creatable
                        className = 'single-file__overlay__category__select'
                        value = { this.state.category.value }
                        options = { options }
                        placeholder = 'Choisissez une catégorie'
                        onChange = { this._onSelectCategory } />
                </div>
            );
        } else {
            const category = this.props.file.category || 'Aucune.';
            return (
                <div className = 'single-file__overlay__category-text'
                    onClick = { this._onCategoryEditable } >
                    { `Catégorie\u00A0: ${category}` }
                </div>
            );
        }
    }

    renderIsPublic() {
        const tooltip = 'Quand un fichier n’est pas public, seul\u00B7e\u00B7s '
            + 'les utilisateurs\u00B7trices du site peuvent y accéder.'
        const { isPublic } = this.state;

        return (
            <div className = 'single-file__overlay__public'>
                <label>
                    <span title = { tooltip } >
                        { 'Public*\u00A0:'}
                    </span>
                    <ToggleSwitch
                        value = { Boolean(isPublic) }
                        onChange = { this._onSwitchIsPublic } />
                </label>
            </div>
        );
    }

    renderDelete() {
        const { name, preDelete } = this.state;
        const trashClassName = preDelete ? 'pre-delete' : 'check-delete';
        const deleteMessage = preDelete ? 'Confirmer\u00A0:' : 'Supprimer\u00A0:';
        const trashAction = preDelete ? this._onDeleteFile : this._onPreDelete;

        return (
            <div className = 'single-file__overlay__delete'>
                <span>{ deleteMessage }</span>
                <div className = { `single-file__overlay__delete__icon single-file__overlay__delete__icon-${trashClassName}` }
                    onClick = { trashAction } >
                    <i className = 'fas fa-trash-alt' />
                </div>
            </div>
        );
    }

    renderFileInfo() {
        const { file_size, created } = this.props.file;
        const creationDate = moment(created).format('DD/MM/YYYY à HH:mm');
        const size = (file_size / (1024 * 1024)).toFixed(2);

        return (
            <div className = 'single-file__overlay__info'>
                { `Téléversé\u00B7e le ${creationDate}, ${size}mo.` }
            </div>
        );
    }
}
