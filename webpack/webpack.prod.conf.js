const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.conf');

module.exports = merge(baseWebpackConfig, {
  output: {
    path: path.resolve(__dirname, '../dist/'),
    filename: 'js/[name].js',
    publicPath: '',
  },
  mode: 'production',
  devtool: false,
  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
    }),
    new CopyPlugin([
      { from: 'app/images', to: 'images' },
      { from: 'app/views', to: 'views' },
      { from: 'app/manifest.json', to: 'manifest.json' },
    ]),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
});
