import React from 'react';
import ReactDOM from 'react-dom';

import { MultichainContainerComponent } from '@popup/multichain/multichain-container';
import { PopupToolbarStartupUtils } from '@popup/multichain/utils/popup-toolbar-startup.utils';
import { SidePanelLifecycleUtils } from '@popup/multichain/utils/side-panel-lifecycle.utils';
import { store } from '@popup/multichain/store';
import { Provider } from 'react-redux';
import './style.scss';

const mountPopup = async () => {
  const redirected =
    await PopupToolbarStartupUtils.redirectToolbarPopupToSidePanelIfNeeded();
  if (redirected) {
    return;
  }

  ReactDOM.render(
    <Provider store={store}>
      <MultichainContainerComponent />
    </Provider>,
    document.getElementById('root'),
  );
};

SidePanelLifecycleUtils.registerSidePanelPageLifecycle();
void mountPopup();

Object.assign(global, { contextType: 'popup' });
