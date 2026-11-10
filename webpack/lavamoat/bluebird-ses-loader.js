const BLUEBIRD_ERROR_TYPES = 'Error["__BluebirdErrorTypes__"]';
const SES_ERROR_TYPES = 'globalThis["__BluebirdErrorTypes__"]';
const BLUEBIRD_DEFINE_ERROR_TYPES =
  'es5.defineProperty(Error, "__BluebirdErrorTypes__",';
const SES_DEFINE_ERROR_TYPES =
  'es5.defineProperty(globalThis, "__BluebirdErrorTypes__",';

// SES lockdown freezes the Error constructor. Bluebird stores its error
// classes on Error, which then throws. Keep them on the compartment global.
const adaptBluebirdErrorTypesForSes = (source) =>
  source
    .replaceAll(BLUEBIRD_DEFINE_ERROR_TYPES, SES_DEFINE_ERROR_TYPES)
    .replaceAll(BLUEBIRD_ERROR_TYPES, SES_ERROR_TYPES);

function bluebirdSesLoader(source) {
  const replaced = adaptBluebirdErrorTypesForSes(source);
  if (
    replaced === source ||
    replaced.includes(BLUEBIRD_ERROR_TYPES) ||
    replaced.includes(BLUEBIRD_DEFINE_ERROR_TYPES)
  ) {
    throw new Error(
      `LavaMoat expected bluebird to store __BluebirdErrorTypes__ on Error in ${this.resourcePath}`,
    );
  }
  return replaced;
}

module.exports = bluebirdSesLoader;
module.exports.adaptBluebirdErrorTypesForSes = adaptBluebirdErrorTypesForSes;
