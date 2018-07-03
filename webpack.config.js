const path = require("path");
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: [path.resolve(__dirname, 'coreui-react-src/index.js')],
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'js/client-admin.app.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    query: {
                        plugins: [
                            ["transform-object-rest-spread"]
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['css-loader']
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/'
                    }
                }]
            },
            {
                test: /\.(gif|png|jpe?g)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'images/'
                        }
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            bypassOnDebug: true, // webpack@1.x
                            disable: true, // webpack@2.x and newer
                        },
                    }
                ],
            }
        ]
    },
    devServer: {
        contentBase: "./public",
        hot: true
    },
    plugins: [
        new Dotenv()
    ]
};
