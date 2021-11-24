import { TokenBalance } from '@interfaces/tokens.interface';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { loadUserTokens } from '@popup/actions/token.actions';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './tokens.component.scss';

const Tokens = ({
  activeAccount,
  userTokens,
  loadUserTokens,
  navigateTo,
  navigateToWithParams,
}: PropsFromRedux) => {
  const [filteredTokenList, setFilteredTokenList] = useState<TokenBalance[]>(
    [],
  );
  const [hiddenTokens, setHiddenTokens] = useState<string[]>([]);

  const loadHiddenTokens = async () => {
    setHiddenTokens(
      (await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.HIDDEN_TOKENS,
      )) ?? [],
    );
  };

  useEffect(() => {
    loadHiddenTokens();
    loadUserTokens(activeAccount.name!);
  }, []);

  useEffect(() => {
    if (userTokens.list) {
      setFilteredTokenList(
        userTokens.list.filter((token) => !hiddenTokens.includes(token.symbol)),
      );
    }
  }, [userTokens]);

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
      {filteredTokenList.length > 0 && (
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
      )}
      {filteredTokenList.length === 0 && (
        <div className="no-tokens">
          {chrome.i18n.getMessage('popup_html_tokens_no_tokens')}
        </div>
      )}
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
