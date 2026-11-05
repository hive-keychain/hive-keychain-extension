import fs from 'fs';
import path from 'path';

const manifestPaths = [
  '../../../manifests/chromium/manifest.json',
  '../../../manifests/chromium-beta/manifest.json',
];

describe('Chromium service worker', () => {
  it.each(manifestPaths)(
    'loads %s as a classic script so LavaMoat with-wrappers can parse',
    (manifestPath) => {
      const manifest = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, manifestPath), 'utf8'),
      );

      expect(manifest.background).toEqual({
        service_worker: 'backgroundBundle.js',
      });
    },
  );
});
