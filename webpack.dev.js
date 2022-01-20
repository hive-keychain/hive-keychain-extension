const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    static: './dist-dev',
  },
  output: {
    path: path.join(__dirname, 'dist-dev'),
    filename: '[name]Bundle.js',
  },
});
