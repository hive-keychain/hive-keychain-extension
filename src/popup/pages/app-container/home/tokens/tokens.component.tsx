import { TokenBalance } from '@interfaces/tokens.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { loadUserTokens } from '@popup/actions/token.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
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
  addToLoadingList,
  removeFromLoadingList,
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
    if (userTokens.loading) {
      addToLoadingList('html_popup_loading_tokens_operation');
    } else {
    }
    removeFromLoadingList('html_popup_loading_tokens_operation');
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
      <Icon
        onClick={() => navigateTo(Screen.TOKENS_SETTINGS)}
        name={Icons.SETTINGS}
        type={IconType.OUTLINED}
        additionalClassName="settings"></Icon>
      {filteredTokenList.length > 0 && (
        <div className="my-tokens">
          {userTokens.list.map((token) => (
            <div className="token" key={token.symbol}>
              <div
                className="balance"
                data-for={`full-balance-tooltip`}
                data-tip={
                  FormatUtils.hasMoreThanXDecimal(parseFloat(token.balance), 3)
                    ? FormatUtils.withCommas(token.balance, 8)
                    : null
                }
                data-iscapture="true">
                {FormatUtils.withCommas(token.balance, 3)}
                {FormatUtils.hasMoreThanXDecimal(parseFloat(token.balance), 3)
                  ? '...'
                  : null}
              </div>
              <ReactTooltip
                id="full-balance-tooltip"
                place="top"
                type="light"
                effect="solid"
                multiline={true}
              />
              <div className="symbol">{token.symbol}</div>
              <Icon
                name={Icons.HISTORY}
                onClick={() =>
                  navigateToWithParams(Screen.TOKENS_HISTORY, { token })
                }
                additionalClassName="history"
                type={IconType.OUTLINED}></Icon>

              <Icon
                name={Icons.SEND}
                onClick={() =>
                  navigateToWithParams(Screen.TOKENS_TRANSFER, { token })
                }
                additionalClassName="send"
                type={IconType.OUTLINED}></Icon>
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
  addToLoadingList,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensComponent = connector(Tokens);
