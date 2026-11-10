import { ExtensionAppRootComponent } from '@popup/multichain/extension-app-root.component';
import { ExtensionUiLifecycleUtils } from '@popup/multichain/utils/extension-ui-lifecycle.utils';
import { PopupThemeStartupUtils } from '@popup/multichain/utils/popup-theme-startup.utils';
import React from 'react';
import ReactDOM from 'react-dom';

const initialTheme = PopupThemeStartupUtils.getCachedTheme();

ReactDOM.render(
  <ExtensionAppRootComponent initialTheme={initialTheme} />,
  document.getElementById('root'),
);

ExtensionUiLifecycleUtils.registerExtensionUiLifecycle();

Object.assign(global, { contextType: 'popup' });
