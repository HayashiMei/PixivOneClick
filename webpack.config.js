const path = require('path');

module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: path.resolve(__dirname, './node_modules'),
        options: {
          presets: [
            [
              'env',
              {
                targets: {
                  chrome: 60,
                },
              },
            ],
          ],
        },
      },
    ],
  },
  devtool: 'source-map',
};
