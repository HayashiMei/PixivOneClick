const path = require('path');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');

module.exports = merge(baseWebpackConfig, {
  output: {
    path: path.resolve(__dirname, '../dist/'),
    filename: 'js/[name].js',
    publicPath: '',
  },
  mode: 'development',
  devtool: 'source-map',
  watch: true,
});
