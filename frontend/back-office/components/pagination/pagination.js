import React from 'react';
import PropTypes from 'prop-types';

import './pagination.scss';

export default class Pagination extends React.Component {
    static propTypes = {
        offset: PropTypes.number,
        quantity: PropTypes.number,
        total: PropTypes.number,
        onChangePage: PropTypes.func.isRequired,
    };

    static defaultProps = {
        offset: 0,
        quantity: 0,
        total: 0,
    };

    render() {
        const { offset, quantity, total } = this.props;
        const { onChangePage } = this.props;

        const previousOffest = offset - quantity < 0 ? 0 : offset - quantity;
        const nextOffset = offset + quantity >= total
            ? (offset > total - quantity ? offset : total - quantity)
            : offset + quantity;
        const offsetEnd = offset + quantity > total ? total : offset + quantity;

        return (
            <div className = 'pagination-component' >
                <div className = 'pagination-component__inner'>
                    <span className = 'pagination-component__inner__arrows'
                        onClick = { () => onChangePage(previousOffest) }>
                        <i className = 'fas fa-caret-left' />
                    </span>
                    <span className = 'pagination-component__inner__arrows'
                        onClick = { () => onChangePage(nextOffset) } >
                        <i className = 'fas fa-caret-right' />
                    </span>
                    <span className = 'pagination-component__inner__label'>
                        { `${offset} - ${offsetEnd} / ${total}` }
                    </span>
                </div>
            </div>
        );
    }


}
