import React from 'react';
import ReactDOM from 'react-dom';
import { I18nProviderComponent } from 'src/common-ui/i18n/i18n-provider.component';
import { PortfolioComponent } from 'src/portfolio/portfolio.component';
import './portfolio.scss';

ReactDOM.render(
  <I18nProviderComponent>
    <PortfolioComponent />
  </I18nProviderComponent>,
  document.getElementById('root'),
);

export {};
