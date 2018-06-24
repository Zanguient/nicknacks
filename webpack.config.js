const path = require("path");
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: [path.resolve(__dirname, 'core-ui-react-src/js/index.js')],
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'js/client.app.js'
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
                use: [ 'style-loader', 'css-loader' ]
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
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
