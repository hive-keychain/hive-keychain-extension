const { merge } = require('webpack-merge');
const common = require('./webpack.firefox.js');
const path = require('path');
const WebpackBundleAnalyzer = require('webpack-bundle-analyzer');
const { DefinePlugin } = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const { toDefinePluginEnv } = require('../env');
const { applyLavaMoat } = require('../lavamoat');
const {
  FIREFOX_JS_MAX_CHUNK_BYTES,
  FirefoxAmoBundleSizePlugin,
  isSplittableChunk,
} = require('./firefox-amo-bundle-size');

module.exports = applyLavaMoat(merge(common, {
  mode: 'production',
  devtool: false,
  output: {
    path: path.join(__dirname, '../../dist-prod-firefox'),
    filename: '[name]Bundle.js',
  },
  // Firefox rejects JavaScript files over 5MB. Keep every emitted chunk smaller
  // than that, including after the SES lockdown prefix is prepended.
  optimization: {
    concatenateModules: false,
    splitChunks: {
      chunks: isSplittableChunk,
      maxSize: FIREFOX_JS_MAX_CHUNK_BYTES,
      maxInitialRequests: Infinity,
      maxAsyncRequests: Infinity,
    },
  },
  plugins: [
    // new WebpackBundleAnalyzer.BundleAnalyzerPlugin(),
    new DefinePlugin(toDefinePluginEnv({ IS_FIREFOX: true })),
    new ESLintPlugin({
      extensions: ['ts', 'tsx'],
      fix: false,
      emitError: true,
      emitWarning: true,
      failOnError: true,
      failOnWarning: true,
      exclude: ['../../node_modules', '../../src/utils/logger.utils.ts'],
    }),
    new FirefoxAmoBundleSizePlugin(),
  ],
}),
  'firefox',
);
