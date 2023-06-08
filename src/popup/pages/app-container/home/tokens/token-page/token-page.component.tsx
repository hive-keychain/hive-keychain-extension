import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { TokenListComponent } from '@popup/pages/app-container/home/tokens/token-page/token-list/token-list.component';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import './token-page.component.scss';

const TokensPage = ({ setTitleContainerProperties }: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_tokens',
      isBackButtonEnabled: true,
    });
  }, []);

  return (
    <div className="tokens-page" aria-label="governance-page">
      <TokenListComponent></TokenListComponent>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensPageComponent = connector(TokensPage);
