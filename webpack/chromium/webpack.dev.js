const { merge } = require('webpack-merge');
const common = require('./webpack.chromium.js');
const path = require('path');
const dotenv = require('dotenv');
const { DefinePlugin } = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  // Use eval-source-map for faster compilation (faster than inline-source-map)
  devtool: 'cheap-module-source-map',
  // Enable webpack caching for faster rebuilds
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
  devServer: {
    static: '../../dist-dev',
  },
  output: {
    path: path.join(__dirname, '../../dist-dev'),
    filename: '[name]Bundle.js',
  },
  plugins: [
    new DefinePlugin({
      'process.env': JSON.stringify(dotenv.config().parsed),
    }),
  ],
});
