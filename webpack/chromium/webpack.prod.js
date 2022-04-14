const { merge } = require('webpack-merge');
const common = require('./webpack.chromium.js');
const path = require('path');
const WebpackBundleAnalyzer = require('webpack-bundle-analyzer');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '../../dist-prod'),
    filename: '[name]Bundle.js',
  },
});
