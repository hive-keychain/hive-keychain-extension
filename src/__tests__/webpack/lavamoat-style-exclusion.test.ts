const {
  revealExcludedStyleModule,
} = require('../../../webpack/lavamoat/style-exclusion');

describe('LavaMoat style exclusion', () => {
  it('lets style-loader child modules keep the exclude loader', () => {
    const module = {
      resource: '/pkg/ReactToastify.css',
      rawRequest:
        '!!/css-loader/index.js!/sass-loader/index.js!/excludeLoader.js!/pkg/ReactToastify.css',
      loaders: [{ loader: '/node_modules/@lavamoat/webpack/src/excludeLoader.js' }],
    };

    expect(revealExcludedStyleModule(module)).toBe(true);
    expect(module.rawRequest).toBe('/pkg/ReactToastify.css');
  });

  it('leaves ordinary modules unchanged', () => {
    const module = {
      resource: '/src/popup/index.tsx',
      rawRequest: './src/popup/index.tsx',
      loaders: [],
    };

    expect(revealExcludedStyleModule(module)).toBe(false);
    expect(module.rawRequest).toBe('./src/popup/index.tsx');
  });
});
