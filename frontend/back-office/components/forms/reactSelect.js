import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import _ from 'lodash';

import './reactSelect.scss';

import { errorHandler } from '../../utils/handlers';

export default class ReactSelect extends React.Component {
    static propTypes = {
        showToast: PropTypes.func.isRequired,
        apiFunc: PropTypes.func,
        className: PropTypes.string.isRequired,
        placeholder: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        options: PropTypes.array,
    };

    static defaultProps = {
        options: [],
    };

    state = {
        isLoading: false,
        selectedOption: null,
        options: this.props.options,

    };

    _loadOptionsFromAPI = (searchText) => {
        const { apiFunc } = this.props;

        this.setState({ isLoading: true });

        this.props.onChange(value);

        apiFunc(searchText)
            .then((axiosResponse) => {
                this.setState({ options: axiosResponse.data });
            })
            .catch((err) => {
                errorHandler(this.props.showToast)(err);
                this.setState({ isLoading: false });
            });
    };

    _onChange = (selectedOption) => {
        const { label, value } = selectedOption;

        this.setState({ selectedOption });
        this.props.onChange(value);
    };

    _onInputChange = (text) => {
        this.props.onChange(text);
    };

    render() {
        const { className, placeholder } = this.props;
        const { selectedOption, options } = this.state;

        return (
            <Select
                className = { className }
                placeholder = { placeholder }
                value = { selectedOption }
                options = { options }
                onChange = { this._onChange }
                onInputChange = { this.props.options.length > 0
                    ? _.debounce(this._loadOptionsFromAPI, 500)
                    : this._onInputChange }
                />
        );
    }
}
