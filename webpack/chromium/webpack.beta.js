const { merge } = require('webpack-merge');
const common = require('../webpack.common.js');
const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '../../dist-beta'),
    filename: '[name]Bundle.js',
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'manifests/chromium-beta', to: '.' }],
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
