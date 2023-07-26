const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require('path');

const config = {
  entry: {
    popup: './src/popup/index.tsx',
    dialog: './src/dialog/index.tsx',
    background: './src/background/index.ts',
    importAccounts: './src/import/import-accounts.tsx',
    importBackup: './src/import/import-backup.tsx',
    addKeyFromLedger: './src/ledger/add-key/index.tsx',
    linkLedgerDevice: './src/ledger/link-device/index.tsx',
    addAccountsFromLedger: './src/ledger/add-accounts/index.tsx',
    web_interface: './src/content-scripts/web-interface/index.ts',
    keychainify: './src/content-scripts/keychainify/index.ts',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(scss|css)$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: { url: false },
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
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'public', to: '.' }],
    }),

    new NodePolyfillPlugin(),
  ],
};

module.exports = config;
