const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.base.config.js');
const fs = require('fs');
const path = require('path');

fs.open('./src/config/env.js', 'w', function (err, fd) {
  const buf = 'export default "production";';
  // fix node v10 bug with callback error: TypeError [ERR_INVALID_CALLBACK]: Callback must be a function
  fs.write(fd, buf, function(err, written, buffer) {});
});

module.exports = merge(webpackBaseConfig, {
  mode: 'production',
  output: {
    publicPath: '/',
    filename: '[name].[hash].js',
    chunkFilename: '[name].[hash].chunk.js'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: "initial",
          test: path.resolve(__dirname, "node_modules"),
          name: "vendor",
          enforce: true
        }
      }
    }
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].[hash].css',
      allChunks: true
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new UglifyJSPlugin({
      uglifyOptions: {
        compress: {
          drop_console: true
        }
      }
    }),
    new HtmlWebpackPlugin({
      filename: '../views/admin.hbs',
      template: './src/template/index.ejs',
      inject: false
    })
  ]
});
