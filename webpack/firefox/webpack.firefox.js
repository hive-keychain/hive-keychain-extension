const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const common = require('../webpack.common.js');

const config = merge(common, {
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'manifests/firefox', to: '.' }],
    }),
  ],
});

module.exports = config;
