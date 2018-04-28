const autoprefixer = require('autoprefixer');

module.exports = () => {
    autoprefixer({
        grid: true,
        browsers: ['last 3 versions'],
    })
};
