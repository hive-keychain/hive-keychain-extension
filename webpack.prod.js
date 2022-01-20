const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
  mode: 'production',
  output: {
    path: path.join(__dirname, 'dist-prod'),
    filename: '[name]Bundle.js',
  },
});
