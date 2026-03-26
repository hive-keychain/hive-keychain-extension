const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const useFastDev = process.env.WEBPACK_FS_CACHE === 'true';

const config = {
  entry: {
    hiveTx: 'hive-tx',
    popup: { import: './src/popup/index.tsx', dependOn: 'hiveTx' },
    dialog: './src/dialog/index.tsx',
    background: './src/background/multichain/multichain-service-worker.ts',
    importAccounts: './src/import/import-accounts.tsx',
    importSettings: './src/import/import-settings.tsx',
    multisigDialog: './src/multisig/multisig-dialog.tsx',
    addKeyFromLedger: './src/ledger/add-key/index.tsx',
    linkLedgerDevice: './src/ledger/link-device/index.tsx',
    peakdNotificationsConfig: './src/peakd-notifications-config/index.tsx',
    addAccountsFromLedger: './src/ledger/add-accounts/index.tsx',
    web_interface: './src/content-scripts/hive/web-interface/index.ts',
    keychainify: './src/content-scripts/hive/keychainify/index.ts',
    evmKeychainLegacyPreferred:
      './src/content-scripts/evm/injected/evm-keychain-legacy-preferred.ts',
    evmKeychainLegacyYielding:
      './src/content-scripts/evm/injected/evm-keychain-legacy-yielding.ts',
    evmContentScript: './src/content-scripts/evm/evm-content-script.ts',
    portfolio: './src/portfolio/index.tsx',
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
