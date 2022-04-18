const { merge } = require('webpack-merge');
const common = require('./webpack.firefox.js');
const path = require('path');
const dotenv = require('dotenv');
const { DefinePlugin } = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: '../../dist-dev-firefox',
  },
  output: {
    path: path.join(__dirname, '../../dist-dev-firefox'),
    filename: '[name]Bundle.js',
  },
  plugins: [
    new DefinePlugin({
      'process.env': JSON.stringify({
        ...dotenv.config().parsed,
        IS_FIREFOX: true,
      }),
    }),
  ],
});
