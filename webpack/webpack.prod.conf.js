const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.conf');
const package = require('../package.json');

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
    new CopyPlugin([{ from: 'app/html', to: 'html' }, { from: 'app/image', to: 'image' }, { from: 'app/manifest.json', to: 'manifest.json' }]),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new ZipPlugin({
      filename: `PixivOneClick-${package.version}.zip`,
      pathPrefix: 'dist',
    }),
  ],
});
