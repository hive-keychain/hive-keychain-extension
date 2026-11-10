import fs from 'fs';
import path from 'path';

const overridePaths = [
  '../../../webpack/lavamoat/chromium/policy-override.json',
  '../../../webpack/lavamoat/firefox/policy-override.json',
];

describe('LavaMoat policy overrides', () => {
  it.each(overridePaths)(
    'gives engine.io the timers and WebSocket it reads from its compartment global in %s',
    (overridePath) => {
      const policy = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, overridePath), 'utf8'),
      );
      const globals =
        policy.resources['socket.io-client>engine.io-client'].globals;

      expect(globals.WebSocket).toBe(true);
      expect(globals.setTimeout).toBe(true);
      expect(globals.clearTimeout).toBe(true);
    },
  );

  it.each(overridePaths)(
    'gives react-dom HTMLIFrameElement for its selection check in %s',
    (overridePath) => {
      const policy = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, overridePath), 'utf8'),
      );

      expect(policy.resources['react-dom'].globals.HTMLIFrameElement).toBe(
        true,
      );
    },
  );

  it.each(overridePaths)(
    'gives react-dropdown-select the window listeners it registers in %s',
    (overridePath) => {
      const policy = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, overridePath), 'utf8'),
      );
      const globals = policy.resources['react-dropdown-select'].globals;

      expect(globals.addEventListener).toBe(true);
      expect(globals.removeEventListener).toBe(true);
      expect(globals.innerHeight).toBe(true);
    },
  );

  it.each(overridePaths)(
    'gives ethers crypto so randomBytes can use the compartment global in %s',
    (overridePath) => {
      const policy = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, overridePath), 'utf8'),
      );

      expect(policy.resources.ethers.globals.crypto).toBe(true);
    },
  );

  it.each(overridePaths)(
    'gives axios crypto for multipart boundaries in %s',
    (overridePath) => {
      const policy = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, overridePath), 'utf8'),
      );

      expect(policy.resources.axios.globals.crypto).toBe(true);
    },
  );

  it.each(overridePaths)(
    'binds Ledger transports to the page WebUSB and WebHID objects in %s',
    (overridePath) => {
      const policy = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, overridePath), 'utf8'),
      );
      const webUsb =
        policy.resources['@ledgerhq/hw-transport-webusb'].globals;
      const webHid =
        policy.resources['@ledgerhq/hw-transport-webhid'].globals;

      expect(webUsb.navigator).toBe(false);
      expect(webUsb['navigator.usb']).toBe(true);
      expect(webHid.navigator).toBe(false);
      expect(webHid['navigator.hid']).toBe(true);
    },
  );

  it.each(overridePaths)(
    'gives drag-and-drop the window listeners it binds in %s',
    (overridePath) => {
      const policy = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, overridePath), 'utf8'),
      );
      const globals =
        policy.resources['@atlaskit/pragmatic-drag-and-drop'].globals;

      expect(globals.addEventListener).toBe(true);
      expect(globals.removeEventListener).toBe(true);
    },
  );
});
