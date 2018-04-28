const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseConfig = require('./webpack/base.config');
const destinationFolder = `${process.cwd()}/public`;

const devConfig = {
    devtool: 'source-map',
    devServer: {
        contentBase: destinationFolder,
        compress: false,
        port: 8080,
        proxy: {
            '*': 'http://localhost:8081',
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            inject: 'body',
        })
    ],
};

module.exports = Object.assign({}, baseConfig, devConfig);
