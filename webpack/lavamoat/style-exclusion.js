const STYLE_RESOURCE = /\.(css|scss|sass)$/;

// style-loader loads CSS through an inline request (`!!css-loader!...!file.css`).
// LavaMoat ignores its exclude loader when that request contains "!".
const revealExcludedStyleModule = (module) => {
  if (
    typeof module?.rawRequest !== 'string' ||
    !module.rawRequest.includes('!')
  ) {
    return false;
  }
  if (!STYLE_RESOURCE.test(module.resource || '')) {
    return false;
  }
  const hasExcludeLoader = module.loaders?.some(({ loader }) =>
    String(loader).endsWith('excludeLoader.js'),
  );
  if (!hasExcludeLoader) {
    return false;
  }
  module.rawRequest = module.resource;
  return true;
};

class LavaMoatStyleExclusionPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(
      'LavaMoatStyleExclusionPlugin',
      (compilation) => {
        compilation.hooks.succeedModule.tap(
          'LavaMoatStyleExclusionPlugin',
          revealExcludedStyleModule,
        );
      },
    );
  }
}

module.exports = {
  LavaMoatStyleExclusionPlugin,
  revealExcludedStyleModule,
};
