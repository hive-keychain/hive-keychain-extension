import fs from 'fs';
import path from 'path';

const firefoxManifestPath = path.resolve(
  __dirname,
  '../../../manifests/firefox/manifest.json',
);

describe('Firefox host permissions', () => {
  it('allows extension requests to every http and https host', () => {
    const manifest = JSON.parse(fs.readFileSync(firefoxManifestPath, 'utf8'));

    expect(manifest.permissions).toEqual([
      'storage',
      'scripting',
      'idle',
      'alarms',
      'notifications',
      'webNavigation',
      'https://*/*',
      'http://*/*',
    ]);
  });
});
