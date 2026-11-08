import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const webpack = require('webpack');
const LavaMoatPlugin = require('@lavamoat/webpack');
const { LOCKDOWN_OPTIONS } = require('../../../webpack/lavamoat');

const compileFixture = (
  fixtureDir: string,
  generatePolicy: boolean,
  target = 'web',
): Promise<void> =>
  new Promise((resolve, reject) => {
    const compiler = webpack({
      mode: 'development',
      devtool: false,
      target,
      context: fixtureDir,
      entry: path.join(fixtureDir, 'app.js'),
      output: {
        path: path.join(fixtureDir, 'dist'),
        filename: 'bundle.js',
      },
      resolve: {
        aliasFields: ['browser'],
      },
      plugins: [
        new LavaMoatPlugin({
          policyLocation: path.join(fixtureDir, 'policy'),
          rootDir: fixtureDir,
          generatePolicy,
          readableResourceIds: true,
          scuttleGlobalThis: { enabled: false },
          inlineLockdown: /bundle\.js$/,
          lockdown: LOCKDOWN_OPTIONS,
        }),
      ],
    });

    compiler.run((error, stats) => {
      compiler.close(() => undefined);
      if (error) {
        reject(error);
        return;
      }
      if (!stats || stats.hasErrors()) {
        reject(
          new Error(
            stats?.toJson().errors?.map((item) => item.message).join('\n') ??
              'LavaMoat fixture build failed',
          ),
        );
        return;
      }
      resolve();
    });
  });

const denyDependencyGlobals = (policyPath: string) => {
  const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8')) as {
    resources: Record<string, { globals?: Record<string, unknown> }>;
  };
  const resourceNames = Object.keys(policy.resources);
  const grantedFetch = resourceNames.some(
    (name) => policy.resources[name].globals?.fetch,
  );
  if (!grantedFetch) {
    throw new Error(
      `Fixture policy did not grant fetch before the denial edit: ${JSON.stringify(policy)}`,
    );
  }
  resourceNames.forEach((name) => {
    const globals = policy.resources[name].globals ?? {};
    Object.keys(globals).forEach((globalName) => {
      if (globalName === 'fetch' || globalName.startsWith('fetch.')) {
        delete globals[globalName];
      }
    });
    policy.resources[name].globals = globals;
  });
  fs.writeFileSync(policyPath, JSON.stringify(policy, null, 2));
};

describe('lavamoat runtime', () => {
  it('denies a dependency global that the policy does not grant', async () => {
    const fixtureDir = path.join(process.cwd(), 'dist-lavamoat-fixture');
    fs.rmSync(fixtureDir, { recursive: true, force: true });
    fs.mkdirSync(path.join(fixtureDir, 'node_modules', 'untrusted-dep'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(fixtureDir, 'package.json'),
      JSON.stringify({
        name: 'lavamoat-fixture',
        private: true,
        dependencies: { 'untrusted-dep': '1.0.0' },
      }),
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'node_modules', 'untrusted-dep', 'package.json'),
      JSON.stringify({
        name: 'untrusted-dep',
        version: '1.0.0',
        main: 'index.js',
      }),
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'node_modules', 'untrusted-dep', 'index.js'),
      'module.exports = function readDeniedGlobal() { return fetch("https://example.invalid/lavamoat"); };\n',
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'app.js'),
      "require('untrusted-dep')();\n",
    );

    try {
      await compileFixture(fixtureDir, true);
      denyDependencyGlobals(path.join(fixtureDir, 'policy', 'policy.json'));
      await compileFixture(fixtureDir, false);

      const result = spawnSync(
        process.execPath,
        [path.join(fixtureDir, 'dist', 'bundle.js')],
        { encoding: 'utf8' },
      );
      const output = `${result.stderr ?? ''}\n${result.stdout ?? ''}`;
      if (result.status === 0) {
        throw new Error(output || 'denied bundle exited successfully');
      }
      expect(output).toMatch(/fetch is not a function/);
    } finally {
      fs.rmSync(fixtureDir, { recursive: true, force: true });
    }
  }, 120000);

  it('denies chrome to debug and keeps its localStorage fallback', async () => {
    const fixtureDir = path.join(process.cwd(), 'dist-lavamoat-debug-fixture');
    const debugSource = path.join(
      process.cwd(),
      'node_modules/@hiveio/hive-js/node_modules/debug',
    );
    fs.rmSync(fixtureDir, { recursive: true, force: true });
    fs.mkdirSync(path.join(fixtureDir, 'node_modules'), { recursive: true });
    fs.cpSync(debugSource, path.join(fixtureDir, 'node_modules', 'debug'), {
      recursive: true,
    });
    fs.mkdirSync(
      path.join(fixtureDir, 'node_modules', 'debug', 'node_modules', 'ms'),
      { recursive: true },
    );
    fs.writeFileSync(
      path.join(
        fixtureDir,
        'node_modules',
        'debug',
        'node_modules',
        'ms',
        'package.json',
      ),
      JSON.stringify({ name: 'ms', version: '2.0.0', main: 'index.js' }),
    );
    fs.writeFileSync(
      path.join(
        fixtureDir,
        'node_modules',
        'debug',
        'node_modules',
        'ms',
        'index.js',
      ),
      'module.exports = function ms() { return 0; };\n',
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'package.json'),
      JSON.stringify({
        name: 'lavamoat-debug-fixture',
        private: true,
        dependencies: { debug: '2.6.9' },
      }),
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'app.js'),
      [
        'global.chrome = { storage: { local: { id: "chrome-storage" } } };',
        'global.localStorage = { id: "local-storage", removeItem() {} };',
        'global.window = global;',
        'const debug = require("debug");',
        'if (!debug.storage || debug.storage.id !== "local-storage") {',
        '  throw new Error("debug storage id " + (debug.storage && debug.storage.id));',
        '}',
        'debug("hive-js:test")("still-runs");',
        'console.log("debug-chrome-denied");',
        '',
      ].join('\n'),
    );

    try {
      await compileFixture(fixtureDir, true);
      const policyPath = path.join(fixtureDir, 'policy', 'policy.json');
      const generated = JSON.parse(fs.readFileSync(policyPath, 'utf8')) as {
        resources: Record<string, { globals?: Record<string, unknown> }>;
      };
      const debugResource = Object.keys(generated.resources).find((name) =>
        name.endsWith('debug'),
      );
      if (
        !debugResource ||
        generated.resources[debugResource].globals?.chrome !== true
      ) {
        throw new Error(
          `debug policy did not record a chrome read: ${JSON.stringify(generated)}`,
        );
      }
      fs.writeFileSync(
        path.join(fixtureDir, 'policy', 'policy-override.json'),
        JSON.stringify({
          resources: {
            [debugResource]: { globals: { chrome: false } },
          },
        }),
      );
      const generatedAfterOverride = fs.readFileSync(policyPath, 'utf8');
      await compileFixture(fixtureDir, false);
      if (fs.readFileSync(policyPath, 'utf8') !== generatedAfterOverride) {
        throw new Error('policy-override.json was copied into policy.json');
      }

      const result = spawnSync(
        process.execPath,
        [path.join(fixtureDir, 'dist', 'bundle.js')],
        { encoding: 'utf8' },
      );
      const output = `${result.stderr ?? ''}\n${result.stdout ?? ''}`;
      if (result.status !== 0 || !output.includes('debug-chrome-denied')) {
        throw new Error(output || 'debug fallback bundle failed');
      }
    } finally {
      fs.rmSync(fixtureDir, { recursive: true, force: true });
    }
  }, 120000);

  it('forwards Logger calls and keeps error stacks with safe console taming', () => {
    const result = spawnSync(
      process.execPath,
      [path.join(__dirname, '../../../scripts/check-lavamoat-console.js')],
      { encoding: 'utf8' },
    );

    if (result.status !== 0) {
      throw new Error(result.stderr || result.stdout || 'lockdown console check failed');
    }
  });
});
