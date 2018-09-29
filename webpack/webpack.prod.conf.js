const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.conf');

const webpackConfig = merge(baseWebpackConfig, {
  output: {
    path: path.resolve(__dirname, '../dist/'),
    filename: 'js/[name].js',
    publicPath: '',
  },
  mode: 'production',
});

webpackConfig.plugins = webpackConfig.plugins.concat([
  new CleanWebpackPlugin(['css', 'js'], {
    root: path.resolve(__dirname, '../dist/'),
    verbose: true,
  }),
  new webpack.optimize.ModuleConcatenationPlugin(),
]);

module.exports = webpackConfig;
