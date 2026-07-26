import { MultichainContainerComponent } from '@popup/multichain/multichain-container';
import { store } from '@popup/multichain/store';
import { Theme } from '@popup/theme.context';
import React from 'react';
import { Provider } from 'react-redux';
import { I18nProviderComponent } from 'src/common-ui/i18n/i18n-provider.component';
import '../style.scss';

interface Props {
  initialTheme: Theme | null;
}

export const ExtensionAppRootComponent = ({ initialTheme }: Props) => (
  <I18nProviderComponent>
    <Provider store={store}>
      <MultichainContainerComponent initialTheme={initialTheme} />
    </Provider>
  </I18nProviderComponent>
);
