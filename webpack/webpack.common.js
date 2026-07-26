const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');

const useFastDev = process.env.WEBPACK_FS_CACHE === 'true';

const config = {
  entry: {
    hiveTx: 'hive-tx',
    extensionApp: {
      import: './src/popup/multichain/extension-app-root.component.tsx',
      dependOn: 'hiveTx',
    },
    popup: { import: './src/popup/index.tsx', dependOn: 'extensionApp' },
    portfolio: {
      import: './src/portfolio/index.tsx',
      dependOn: 'extensionApp',
    },
    dialog: './src/dialog/index.tsx',
    background: './src/background/multichain/multichain-service-worker.ts',
    importAccounts: './src/import/import-accounts.tsx',
    importSettings: './src/import/import-settings.tsx',
    multisigDialog: './src/multisig/multisig-dialog.tsx',
    peakdNotificationsConfig: './src/peakd-notifications-config/index.tsx',
    web_interface: './src/content-scripts/hive/web-interface/index.ts',
    keychainify: './src/content-scripts/hive/keychainify/index.ts',
    evmKeychainLegacyPreferred:
      './src/content-scripts/evm/injected/evm-keychain-legacy-preferred.ts',
    evmKeychainLegacyYielding:
      './src/content-scripts/evm/injected/evm-keychain-legacy-yielding.ts',
    evmContentScript: './src/content-scripts/evm/evm-content-script.ts',
    vault: './src/vault/index.ts',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            cacheCompression: false,
          },
        },
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
            options: {
              // Disable source maps in sass-loader (webpack handles them)
              // This significantly speeds up compilation
              sourceMap: false,
              sassOptions: {
                outputStyle: 'expanded',
              },
            },
          },
        ],
      },
      {
        test: /\.ts(x)?$/,
        use: {
          loader: 'ts-loader',
          options: {
            experimentalWatchApi: true,
            // Fast dev prioritizes rebuild speed; run npm run typecheck when needed.
            onlyCompileBundledFiles: useFastDev,
            transpileOnly: useFastDev,
            useCaseSensitiveFileNames: useFastDev,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
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
    fallback: {
      buffer: require.resolve('buffer/'),
      crypto: false,
      process: require.resolve('process/browser'),
    },
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'public', to: '.' }],
    }),

    new NodePolyfillPlugin({
      excludeAliases: ['Buffer', 'crypto'],
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer/', 'Buffer'],
      process: require.resolve('process/browser'),
    }),
  ],
};

module.exports = config;
