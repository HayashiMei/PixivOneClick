const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.conf');

module.exports = merge(baseWebpackConfig, {
  output: {
    path: path.resolve(__dirname, '../dist/'),
    filename: 'js/[name].js',
    publicPath: '',
  },
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
    }),
    new CopyWebpackPlugin([{ from: 'app/html', to: 'html' }, { from: 'app/image', to: 'image' }, { from: 'app/manifest.json', to: 'manifest.json' }]),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
});
