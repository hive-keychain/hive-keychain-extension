const { merge } = require('webpack-merge');
const common = require('./webpack.firefox.js');
const path = require('path');
const WebpackBundleAnalyzer = require('webpack-bundle-analyzer');
const { DefinePlugin } = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '../../dist-prod-firefox'),
    filename: '[name]Bundle.js',
  },
  plugins: [
    // new WebpackBundleAnalyzer.BundleAnalyzerPlugin(),
    new DefinePlugin({
      'process.env': JSON.stringify({ IS_FIREFOX: true }),
    }),
    new ESLintPlugin({
      extensions: ['ts', 'tsx'],
      fix: false,
      emitError: true,
      emitWarning: true,
      failOnError: true,
      failOnWarning: true,
      exclude: ['../../node_modules', '../../src/utils/logger.utils.ts'],
    }),
  ],
});
