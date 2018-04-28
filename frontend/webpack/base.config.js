const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const destinationFolder = `${process.cwd()}/public`;

module.exports = {
    entry: [
        'babel-polyfill',
        './index.js',
    ],
    module: {
        rules: [
            {
                test: /\.html$/,
                use: {
                    loader: 'raw-loader',
                },
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: ['transform-class-properties'],
                        presets: ['flow', 'react', 'es2015'],
                    },
                },
            },
            {
                test: /\.s?css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: require('./postcss'),
                        },
                    },
                    'sass-loader',
                ],
            },
            {
                test: /\.(jpg|png|gif|svg|pdf|ico)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name]-[hash:8].[ext]'
                        },
                    },
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin([destinationFolder]),
        new ExtractTextPlugin('[name].[hash].css'),
        new webpack.NoEmitOnErrorsPlugin(),
    ],
    output: {
        filename: '[name]-bundle.[hash].js',
        path: destinationFolder,
        publicPath: '/',
    },
};
