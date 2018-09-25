const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: {
    main: './src/main',
    vendors: './src/vendors'
  },
  devServer: {
        host: 'localhost',
        disableHostCheck: true,
        headers: {
            "Access-Control-Allow-Origin": "http://localhost:8080",
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
        }
  },
  output: {
    path: path.join(__dirname, '../dist')
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              loaders: {
                less: ExtractTextPlugin.extract({
                  use: ['css-loader?minimize', 'postcss-loader', 'less-loader'],
                  fallback: 'vue-style-loader'
                }),
                css: ExtractTextPlugin.extract({
                  use: ['css-loader', 'postcss-loader', 'less-loader'],
                  fallback: 'vue-style-loader'
                })
              }
            }
          },
          {
            loader: 'iview-loader',
            options: {
              prefix: false
            }
          }
        ]
      },
      {
        test: /iview\/.*?js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader?minimize', 'postcss-loader'],
          fallback: 'style-loader'
        })
      },
      {
        test: /\.less/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader?minimize', 'postcss-loader', 'less-loader'],
          fallback: 'style-loader'
        })
      },
      {
        test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
        loader: 'url-loader?limit=1024'
      },
      {
        test: /\.(html|tpl)$/,
        loader: 'html-loader'
      }
    ]
  },
  plugins: [
    //copy the old public folder to webpack dist folder
    new CopyWebpackPlugin([
        { from: 'public' }
    ]),
    new Dotenv()
  ],
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      'vue': 'vue/dist/vue.esm.js'}
  }
};
