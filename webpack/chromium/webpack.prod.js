const { merge } = require('webpack-merge');
const common = require('./webpack.chromium.js');
const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '../../dist-prod'),
    filename: '[name]Bundle.js',
  },
  plugins: [
    new ESLintPlugin({
      extensions: ['ts', 'tsx'],
      fix: false,
      emitError: true,
      emitWarning: true,
      failOnError: true,
      failOnWarning: true,
      exclude: ['../../node_modules', '../../src/utils/logger.utils.ts'],
    }),
    // new BundleAnalyzerPlugin(),
  ],
  optimization: {
    runtimeChunk: 'single',
  },
});
