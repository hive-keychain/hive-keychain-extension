const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require('path');

const config = {
  entry: {
    popup: { import: './src/popup/index.tsx', dependOn: 'shared' },
    dialog: { import: './src/dialog/index.tsx', dependOn: 'shared' },
    background: { import: './src/background/index.ts' },
    importAccounts: {
      import: './src/import/import-accounts.tsx',
    },
    importSettings: {
      import: './src/import/import-settings.tsx',
    },
    addKeyFromLedger: {
      import: './src/ledger/add-key/index.tsx',
      dependOn: 'shared',
    },
    addAccountsFromLedger: {
      import: './src/ledger/add-accounts/index.tsx',
      dependOn: 'shared',
    },
    web_interface: {
      import: './src/content-scripts/web-interface/index.ts',
    },
    keychainify: {
      import: './src/content-scripts/keychainify/index.ts',
    },
    shared: ['@hiveio/dhive', 'moment', 'hive-tx'],
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
