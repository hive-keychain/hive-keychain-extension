import { EXTENSION_UI_RUNTIME_PORT } from 'src/utils/extension-ui-runtime.utils';

const registerExtensionUiLifecycle = (): void => {
  chrome.runtime.connect({ name: EXTENSION_UI_RUNTIME_PORT });
};

export const ExtensionUiLifecycleUtils = {
  registerExtensionUiLifecycle,
};
