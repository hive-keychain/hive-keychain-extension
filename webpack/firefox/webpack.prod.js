const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const WebpackBundleAnalyzer = require('webpack-bundle-analyzer');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'dist-prod-firefox'),
    filename: '[name]Bundle.js',
  },
  plugins: [new WebpackBundleAnalyzer.BundleAnalyzerPlugin()],
});
