import { loadUserTokens } from '@popup/actions/token.actions';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import FormatUtils from 'src/utils/format.utils';
import './tokens.component.scss';

const Tokens = ({
  activeAccount,
  userTokens,
  loadUserTokens,
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
      <div className="my-tokens">
        {userTokens.list.map((token) => (
          <div className="token" key={token.symbol}>
            <div className="balance">
              {FormatUtils.withCommas(token.balance, 8)}
            </div>
            <div className="symbol">{token.symbol}</div>
            <img className="history" src="/assets/images/history.png" />
            <img className="send" src="/assets/images/transfer.png" />
          </div>
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount, userTokens: state.userTokens };
};

const connector = connect(mapStateToProps, { loadUserTokens });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensComponent = connector(Tokens);
