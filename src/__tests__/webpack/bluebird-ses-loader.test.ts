const {
  adaptBluebirdErrorTypesForSes,
} = require('../../../webpack/lavamoat/bluebird-ses-loader');

describe('bluebird SES loader', () => {
  it('stores Bluebird error classes on globalThis instead of the frozen Error constructor', () => {
    const source = `
var errorTypes = Error["__BluebirdErrorTypes__"];
if (!errorTypes) {
    es5.defineProperty(Error, "__BluebirdErrorTypes__", {
        value: errorTypes
    });
}
return e instanceof Error["__BluebirdErrorTypes__"].OperationalError;
`;

    const adapted = adaptBluebirdErrorTypesForSes(source);

    expect(adapted).not.toContain('Error["__BluebirdErrorTypes__"]');
    expect(adapted).not.toContain(
      'es5.defineProperty(Error, "__BluebirdErrorTypes__",',
    );
    expect(adapted).toContain('globalThis["__BluebirdErrorTypes__"]');
    expect(adapted).toContain(
      'es5.defineProperty(globalThis, "__BluebirdErrorTypes__",',
    );
  });
});
