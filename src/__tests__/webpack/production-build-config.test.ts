import path from 'path';

type ProductionWebpackConfig = {
  devtool?: unknown;
};

const repoRoot = path.resolve(__dirname, '../../..');
const productionConfigs: Array<[string, ProductionWebpackConfig]> = [
  ['Chromium', require(path.join(repoRoot, 'webpack/chromium/webpack.prod.js'))],
  ['Chromium beta', require(path.join(repoRoot, 'webpack/chromium/webpack.beta.js'))],
  ['Firefox', require(path.join(repoRoot, 'webpack/firefox/webpack.prod.js'))],
];

describe.each(productionConfigs)('%s production build', (_name, config) => {
  it('does not emit source maps', () => {
    expect(config.devtool).toBe(false);
  });
});
