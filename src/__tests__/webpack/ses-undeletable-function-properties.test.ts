const { spawnSync } = require('child_process');

const runSes = (body: string) =>
  spawnSync(process.execPath, ['-e', `require('ses');\n${body}\n`], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

const definePoison = `
  const definePoison = (target, prop) => {
    const existing = Object.getOwnPropertyDescriptor(target, prop);
    if (existing && existing.configurable === false) {
      return;
    }
    Object.defineProperty(target, prop, {
      configurable: false,
      enumerable: false,
      get() {
        throw new TypeError('restricted');
      },
      set() {
        throw new TypeError('restricted');
      },
    });
  };
`;

describe('SES undeletable legacy function properties', () => {
  it('finishes lockdown when TextEncoder arguments and caller cannot be deleted', () => {
    const result = runSes(`
      ${definePoison}
      definePoison(TextEncoder, 'arguments');
      definePoison(TextEncoder, 'caller');
      globalThis.repairIntrinsics();
      globalThis.hardenIntrinsics();
      if (
        Object.prototype.hasOwnProperty.call(Function.prototype, 'arguments') ||
        Object.prototype.hasOwnProperty.call(Function.prototype, 'caller')
      ) {
        throw new Error('Function.prototype legacy properties were kept');
      }
      console.log('LOCKDOWN_OK');
    `);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('LOCKDOWN_OK');
    expect(result.stderr).toContain(
      'Tolerating undeletable intrinsics.TextEncoder.arguments',
    );
    expect(result.stderr).toContain(
      'Tolerating undeletable intrinsics.TextEncoder.caller',
    );
    expect(result.stderr).not.toContain('failed to delete');
  });

  it('still aborts lockdown when an unknown intrinsic property cannot be deleted', () => {
    const result = runSes(`
      Object.defineProperty(TextEncoder, 'legacyExtra', {
        configurable: false,
        enumerable: false,
        value: 1,
      });
      globalThis.repairIntrinsics();
      console.log('LOCKDOWN_OK');
    `);

    expect(result.status).not.toBe(0);
    expect(`${result.stderr}\n${result.stdout}`).toContain('legacyExtra');
    expect(`${result.stderr}\n${result.stdout}`).not.toContain('LOCKDOWN_OK');
  });
});
