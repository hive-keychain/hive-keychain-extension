const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const config = {
  mode: 'development',
  entry: {
    popup: './src/popup/index.tsx',
    dialog: './src/dialog/index.tsx',
    background: './src/background/index.ts',
    import: './src/import/index.tsx',
    web_interface: './src/content-scripts/web-interface/index.ts',
  },
  output: { path: path.join(__dirname, 'dist'), filename: '[name]Bundle.js' },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.ts(x)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/,
        use: 'file-loader',
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              mimetype: 'image/png',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.ts'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
  },
  devServer: {
    contentBase: './dist',
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'public', to: '.' }],
    }),
    new NodePolyfillPlugin(),
  ],
};

module.exports = config;
