import { EXTENSION_UI_RUNTIME_PORT } from 'src/utils/extension-ui-runtime.utils';

let extensionUiPortCount = 0;

const hasConnectedExtensionUiPort = (): boolean => extensionUiPortCount > 0;

const registerExtensionUiLifecycle = (): void => {
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== EXTENSION_UI_RUNTIME_PORT) {
      return;
    }

    extensionUiPortCount += 1;
    port.onDisconnect.addListener(() => {
      extensionUiPortCount = Math.max(0, extensionUiPortCount - 1);
    });
  });
};

export const ExtensionUiLifecycle = {
  hasConnectedExtensionUiPort,
  registerExtensionUiLifecycle,
};
