import React from 'react';
import ReactDOM from 'react-dom';

import { MultichainContainerComponent } from '@popup/multichain/multichain-container';
import { store } from '@popup/multichain/store';
import { Provider } from 'react-redux';
import './style.scss';

ReactDOM.render(
  <Provider store={store}>
    <MultichainContainerComponent />
  </Provider>,
  document.getElementById('root'),
);
