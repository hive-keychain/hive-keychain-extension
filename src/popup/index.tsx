import React from 'react';
import ReactDOM from 'react-dom';

import { MultichainContainerComponent } from '@popup/multichain/multichain-container';
import { store } from '@popup/multichain/store';
import { PopupToolbarStartupUtils } from '@popup/multichain/utils/popup-toolbar-startup.utils';
import { SidePanelLifecycleUtils } from '@popup/multichain/utils/side-panel-lifecycle.utils';
import { ExtensionUiLifecycleUtils } from '@popup/multichain/utils/extension-ui-lifecycle.utils';
import { Provider } from 'react-redux';
import { I18nProviderComponent } from 'src/common-ui/i18n/i18n-provider.component';
import './style.scss';

const mountPopup = async () => {
  const redirected =
    await PopupToolbarStartupUtils.redirectToolbarPopupToSidePanelIfNeeded();
  if (redirected) {
    return;
  }

  ReactDOM.render(
    <I18nProviderComponent>
      <Provider store={store}>
        <MultichainContainerComponent />
      </Provider>
    </I18nProviderComponent>,
    document.getElementById('root'),
  );
};

SidePanelLifecycleUtils.registerSidePanelPageLifecycle();
ExtensionUiLifecycleUtils.registerExtensionUiLifecycle();
void mountPopup();

Object.assign(global, { contextType: 'popup' });
