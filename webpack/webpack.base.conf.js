const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isLocal = !process.env.NODE_ENV;

module.exports = {
  entry: {
    background: path.resolve(__dirname, '../app/src/background.js'),
    content: path.resolve(__dirname, '../app/src/content.js'),
    options: path.resolve(__dirname, '../app/src/options.js'),
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: /(node_modules)/,
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
        exclude: /(node_modules)/,
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },
  optimization: {
    runtimeChunk: true,
    splitChunks: {
      chunks: 'all',
    },
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        terserOptions: {
          compress: {
            pure_funcs: isLocal ? [] : ['console.info', 'console.log'],
          },
        },
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
  ],
  node: {
    buffer: false,
  },
};
