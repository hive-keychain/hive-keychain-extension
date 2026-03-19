const { merge } = require('webpack-merge');
const common = require('./webpack.chromium.js');
const path = require('path');
const dotenv = require('dotenv');
const { DefinePlugin } = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  // Browser extension CSP blocks eval-based sourcemaps.
  devtool: 'cheap-module-source-map',
  // Enable webpack caching for faster rebuilds
  cache: {
    type: 'filesystem',
    name: 'chromium-development',
    buildDependencies: {
      config: [
        __filename,
        path.resolve(__dirname, '../webpack.common.js'),
        path.resolve(__dirname, '../../tsconfig.json'),
        path.resolve(__dirname, '../../.babelrc'),
      ],
    },
  },
  watchOptions: {
    ignored: /node_modules|dist-dev/,
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
