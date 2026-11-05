import fs from 'fs';
import path from 'path';

const overridePaths = [
  '../../../webpack/lavamoat/chromium/policy-override.json',
  '../../../webpack/lavamoat/firefox/policy-override.json',
];

describe('LavaMoat policy overrides', () => {
  it.each(overridePaths)(
    'gives engine.io the timers it reads from its compartment global in %s',
    (overridePath) => {
      const policy = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, overridePath), 'utf8'),
      );
      const globals =
        policy.resources['socket.io-client>engine.io-client'].globals;

      expect(globals.setTimeout).toBe(true);
      expect(globals.clearTimeout).toBe(true);
    },
  );
});
