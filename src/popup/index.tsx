import React from 'react';
import ReactDOM from 'react-dom';

import { ExtensionAppRootComponent } from '@popup/multichain/extension-app-root.component';
import { PopupToolbarStartupUtils } from '@popup/multichain/utils/popup-toolbar-startup.utils';
import { PopupThemeStartupUtils } from '@popup/multichain/utils/popup-theme-startup.utils';
import { SidePanelLifecycleUtils } from '@popup/multichain/utils/side-panel-lifecycle.utils';
import { ExtensionUiLifecycleUtils } from '@popup/multichain/utils/extension-ui-lifecycle.utils';

const mountPopup = async () => {
  const initialTheme = PopupThemeStartupUtils.getCachedTheme();
  const redirected =
    await PopupToolbarStartupUtils.redirectToolbarPopupToSidePanelIfNeeded();
  if (redirected) {
    return;
  }

  ReactDOM.render(
    <ExtensionAppRootComponent initialTheme={initialTheme} />,
    document.getElementById('root'),
  );
};

SidePanelLifecycleUtils.registerSidePanelPageLifecycle();
ExtensionUiLifecycleUtils.registerExtensionUiLifecycle();
void mountPopup();

Object.assign(global, { contextType: 'popup' });
