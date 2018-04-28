import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone'
import Select from 'react-select';

import 'react-select/dist/react-select.css';

import './fileManager.scss';

import * as API from '../../api/files';

import { ALLOWED_EXTENSIONS, ALLOWED_MIMES, MAX_FILE_SIZE } from '../../consts/files';

import AuthorizationContext from '../../components/authorization/authorizationContext';

import SingleFile from '../../components/files/singleFile';
import ToggleSwitch from '../../components/forms/toggleSwitch';
import Pagination from '../../components/pagination/pagination';

import { errorHandler } from '../../utils/handlers';

export default class FileManager extends React.Component {
    static propTypes = {
        showToast: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
        addOnCloseHandler: PropTypes.func.isRequired,
        removeOnCloseHandler: PropTypes.func.isRequired,
    };

    state = {
        pagination: {
            offset: 0,
            quantity: 20,
            total: 0,
        },
        isSendingFiles: false,
        isLoadingFiles: false,
        files: [],
        categories: {
            options: [],
            values: [],
        },
        search: {
            name: '',
            isPublic: true,
        },
        style: {
            height: '100%',
        }
    };

    componentDidMount() {
        const modalBox = document.getElementById('file-manager-modal');
        const height = `calc(${modalBox.clientHeight - 7}px - 3.5em)`;

        this.setState({ style: { height } });

        this.props.addOnCloseHandler(this.props.onClose);
        this._onLoadFiles();
        this._onLoadCategoryOption();
    }

    componentWillUnmount() {
        this.props.removeOnCloseHandler(this.props.onClose);
    }

    _onChangePage = (offset) => {
        this.setState(
            (state) => ({
                pagination: Object.assign({}, this.state.pagination, { offset }),
            }),
            () => this._onLoadFiles()
        );
    };

    _onReloadOneFile = (fileId) => {
        this._onLoadCategoryOption();
        API.loadOneFile(fileId)
            .then((axiosResponse) => {
                const reloadedFile = axiosResponse.data;
                const newFiles = this.state.files
                    .map(file => file.id === reloadedFile.id
                        ? reloadedFile
                        : file
                    );

                this.setState({ files: newFiles });
            })
            .catch(() => {
                this.props.showToast('Impossible de récupérer ce fichier.');

            });
    };

    _onLoadFiles = () => {
        const { offset, quantity } = this.state.pagination;
        const { name, isPublic } = this.state.search;
        const categories = this.state.categories.values
            .map(category => category.value);

        this.setState({ isLoadingFiles: true });

        API.loadFiles(offset, quantity, categories, name, isPublic)
            .then((axiosResponse) => {
                const { files, total } = axiosResponse.data;
                this.setState({
                    files,
                    isLoadingFiles: false,
                    pagination: Object.assign({}, this.state.pagination, { total }),
                });
            })
            .catch((err) => {
                this.props.showToast('Impossible de récupérer vos fichiers.');
                this.setState({ isLoadingFiles: false });
            });
    };

    _onLoadCategoryOption = () => {
        API.getCategories()
            .then((axiosResponse) => {
                this.setState({
                    categories: Object.assign({}, this.state.categories, { options: axiosResponse.data || []}),
                });
            })
            .catch(errorHandler(this.props.showToast));
    };

    _deletePreview = (files) => {
        files.forEach((file) => {
            window.URL.revokeObjectURL(file.preview);
        });
    };

    _onDropFiles = (userGroups, files) => {
        const mimes = files.map(file => file.type);
        const typesOk = mimes.every(mime => ALLOWED_MIMES.includes(mime));
        const sizes = files.map(file => file.size);

        if (files.length > 6) {
            this.props.showToast('Jusqu’à 6 fichiers simultanément.');
            return;
        }

        if (!typesOk || files.length === 0) {
            this.props.showToast('Fichier non accepté. Voir la liste des fichiers acceptés.');
            return;
        }

        // check file size with respect of allowed max file size by user

        this.setState({ isSendingFiles: true });

        API.sendFiles(files)
            .then((axiosResponse) => {
                this.props.showToast('Les fichiers ont bien été téléversés.', 'success');
                this.setState({ isSendingFiles: false });
                this._onLoadFiles();
                this._deletePreview(files);
            })
            .catch((err) => {
                errorHandler(this.props.showToast)(err);
                this.setState({ isSendingFiles: false });
                this._deletePreview(files);
            });
    };

    _onChangeCategory = (options) => {
        this.setState({
            categories: Object.assign({}, this.state.categories, {
                values: options,
            }),
        });
    };

    _onChangeName = (event) => {
        const name = event.target.value;
        this.setState({
            search: Object.assign({}, this.state.search, { name }),
        });
    };

    _onChangePublic = () => {
        const newValue = !this.state.search.isPublic;
        this.setState({
            search: Object.assign({}, this.state.search, { isPublic: newValue }),
        });
    };

    _onSubmitSearch = (event) => {
        event.preventDefault();
        this._onLoadFiles();
    };

    _onResetSearch = (event) => {
        event.preventDefault();
        this.setState({
            categories: Object.assign({}, this.state.categories, { values: [] }),
            search: Object.assign({}, this.state.search, { name: '', isPublic: true }),
        });
    };

    render() {
        const styleClass = { height: this.state.style.height };

        return (
            <React.Fragment>
                <div className = 'file-manager' id = 'file-manager-modal'>
                    <div className = 'file-manager__header'>
                        Gestionnaire de fichiers
                    </div>
                    <div className = 'file-manager__close-button' onClick = { this.props.onClose } >
                        <i className = 'fas fa-times' title = 'Fermer le gestionnaire' />
                    </div>
                    <div className = 'file-manager__content'
                        style = { styleClass } >
                        { this.renderDropZone() }
                        { this.renderSearch() }
                        { this.renderFiles() }
                    </div>
                </div>
                <div className = 'file-manager-fog' onClick = { this.props.onClose } />
            </React.Fragment>
        );
    }

    renderDropZone() {
        const { isSendingFiles } = this.state;
        return (
            <div className = 'file-manager__content__drop-zone'>
                <AuthorizationContext.Consumer>
                    { (authContext) => (
                        <Dropzone onDrop = { files => this._onDropFiles(authContext.groups, files) }
                            accept = { ALLOWED_MIMES.join(', ') }
                            className = { `dropzone-main ${isSendingFiles ? 'dropzone-sending' : ''}` }
                            activeClassName = 'dropzone-active'
                            rejectClassName = 'dropzone-reject'>
                            { isSendingFiles
                                ? 'Téléversement en cours.'
                                : 'Glisser/Déposer vos images ou fichiers.' }
                            { isSendingFiles
                                ? <i className = 'fas fa-spinner fa-pulse' />
                                : <i className = 'fas fa-file-upload' /> }
                        </Dropzone>
                    ) }
                </AuthorizationContext.Consumer>
            </div>
        );
    }

    renderSearch() {
        const { categories, search } = this.state;
        const { offset, quantity, total } = this.state.pagination;
        const options = categories.options.map(cat => ({
            label: cat,
            value: cat,
        }));

        return (
            <div className = 'file-manager__content__search' >
                <form onSubmit = { this._onSubmitSearch }
                    onReset = { this._onResetSearch } >
                    <Pagination
                        offset = { offset }
                        quantity = { quantity }
                        total = { total }
                        onChangePage = { this._onChangePage } />
                    <span>{ 'Filtrer par\u00A0:' }</span>
                    <Select className = 'file-manager__content__search__category'
                        value = { categories.values }
                        multi = { true }
                        options = { options }
                        placeholder = 'Choisissez une catégorie'
                        onChange = { this._onChangeCategory }
                        />
                    <input className = 'file-manager__content__search__name'
                        type = 'text'
                        value = { search.name }
                        placeholder = 'Nom du fichier'
                        onChange = { this._onChangeName }
                        />
                    <label className = 'file-manager__content__search__public'>
                        <span>Public</span>
                        <ToggleSwitch
                            value = { Boolean(search.isPublic) }
                            onChange = { this._onChangePublic }
                            />
                    </label>
                    <input type = 'submit' value = 'Valider' />
                    <input type = 'reset' value = 'Reset' />
                </form>
            </div>
        );
    }

    renderFiles() {
        const { files = [], categories } = this.state;
        const filesToDisplay = files.map(file => (
            <SingleFile key = { file.id }
                showToast = { this.props.showToast }
                file = { file }
                reloadFiles = { this._onLoadFiles }
                reloadOneFile = { this._onReloadOneFile }
                categories = { categories.options }
                />
        ));

        return (
            <div className = 'file-manager__content__files' >
                { filesToDisplay }
            </div>
        );
    }
}
