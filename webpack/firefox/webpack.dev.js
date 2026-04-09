const { merge } = require('webpack-merge');
const common = require('./webpack.firefox.js');
const path = require('path');
const dotenv = require('dotenv');
const { DefinePlugin } = require('webpack');

const useFilesystemCache = process.env.WEBPACK_FS_CACHE === 'true';
const cache = useFilesystemCache
  ? {
      type: 'filesystem',
      name: 'firefox-development-fast',
      version: 'safe-opt-in-fast-dev-v1',
      buildDependencies: {
        config: [
          __filename,
          path.resolve(__dirname, '../webpack.common.js'),
          path.resolve(__dirname, '../../tsconfig.json'),
          path.resolve(__dirname, '../../.babelrc'),
          path.resolve(__dirname, '../../.env'),
        ],
      },
    }
  : false;

module.exports = merge(common, {
  mode: 'development',
  // Browser extension CSP blocks eval-based sourcemaps.
  devtool: 'cheap-module-source-map',
  // Default dev scripts enable this cache for faster rebuilds. Use :safe scripts if it goes stale.
  cache,
  watchOptions: {
    ignored:
      /node_modules|dist-dev|dist-dev-firefox|dist-prod|dist-prod-firefox|dist-beta|\.git|documentation|example/,
  },
  output: {
    path: path.join(__dirname, '../../dist-dev-firefox'),
    filename: '[name]Bundle.js',
  },
  plugins: [
    new DefinePlugin({
      'process.env': JSON.stringify({
        ...(dotenv.config().parsed || {}),
        IS_FIREFOX: true,
      }),
    }),
  ],
});
