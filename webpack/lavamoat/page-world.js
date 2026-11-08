const { DefinePlugin } = require('webpack');
const common = require('../webpack.common');
const { toDefinePluginEnv } = require('../env');
const { pageWorldEntries } = require('./index');

const createPageWorldConfig = ({ outputPath, isFirefox }) => {
  const plugins = common.plugins.filter(
    (plugin) => plugin?.constructor?.name !== 'CopyPlugin',
  );

  return {
    mode: 'production',
    devtool: false,
    entry: pageWorldEntries(common.entry),
    module: common.module,
    resolve: common.resolve,
    output: {
      path: outputPath,
      filename: '[name]Bundle.js',
    },
    plugins: [
      ...plugins,
      new DefinePlugin(toDefinePluginEnv({ IS_FIREFOX: isFirefox })),
    ],
  };
};

module.exports = { createPageWorldConfig };
