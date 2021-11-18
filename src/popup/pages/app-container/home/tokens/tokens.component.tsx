import {
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { loadUserTokens } from '@popup/actions/token.actions';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import FormatUtils from 'src/utils/format.utils';
import './tokens.component.scss';

const Tokens = ({
  activeAccount,
  userTokens,
  loadUserTokens,
  navigateTo,
  navigateToWithParams,
}: PropsFromRedux) => {
  useEffect(() => {
    loadUserTokens(activeAccount.name!);
  }, []);

  return (
    <div className="tokens-page">
      <PageTitleComponent
        title="popup_html_tokens"
        isBackButtonEnabled={true}
      />

      <div
        className="disclaimer"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_view_tokens_balance'),
        }}></div>
      <img
        className="settings"
        src="/assets/images/settings.png"
        onClick={() => navigateTo(Screen.TOKENS_SETTINGS)}
      />
      <div className="my-tokens">
        {userTokens.list.map((token) => (
          <div className="token" key={token.symbol}>
            <div className="balance">
              {FormatUtils.withCommas(token.balance, 8)}
            </div>
            <div className="symbol">{token.symbol}</div>
            <img
              className="history"
              src="/assets/images/history.png"
              onClick={() =>
                navigateToWithParams(Screen.TOKENS_HISTORY, { token })
              }
            />
            <img
              className="send"
              src="/assets/images/transfer.png"
              onClick={() =>
                navigateToWithParams(Screen.TOKENS_TRANSFER, { token })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount, userTokens: state.userTokens };
};

const connector = connect(mapStateToProps, {
  loadUserTokens,
  navigateTo,
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensComponent = connector(Tokens);
