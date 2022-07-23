const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './main.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'build/dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/i,
                exclude: /node_modules/,
                include: path.resolve(__dirname, './classes'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(jpg|jpeg|png|svg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Phaser Blast',
            template: path.resolve(__dirname, 'index.html'),
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, './assets'),
                    to: path.resolve(__dirname, './build/dist/assets'),
                }
            ]
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserWebpackPlugin({
                test: /\.js$/i,
            })
        ]
    }
}