import { TokenBalance } from '@interfaces/tokens.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { loadTokens, loadUserTokens } from '@popup/actions/token.actions';
import { Icons } from '@popup/icons.enum';
import { TokenItemComponent } from '@popup/pages/app-container/home/tokens/token-item/token-item.component';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './tokens.component.scss';

const Tokens = ({
  activeAccount,
  userTokens,
  allTokens,
  loadUserTokens,
  navigateTo,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
  loadTokens,
}: PropsFromRedux) => {
  const [filteredTokenList, setFilteredTokenList] = useState<TokenBalance[]>();
  const [hiddenTokens, setHiddenTokens] = useState<string[]>([]);

  const loadHiddenTokens = async () => {
    setHiddenTokens(
      (await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.HIDDEN_TOKENS,
      )) ?? [],
    );
  };

  useEffect(() => {
    loadTokens();
    loadHiddenTokens();
    loadUserTokens(activeAccount.name!);
    setTitleContainerProperties({
      title: 'popup_html_tokens',
      isBackButtonEnabled: true,
    });
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
      {allTokens.length > 0 &&
        filteredTokenList &&
        filteredTokenList.length > 0 && (
          <div className="my-tokens">
            {filteredTokenList.map((token) => (
              <TokenItemComponent
                key={token.symbol}
                tokenBalance={token}
                tokenInfo={allTokens.find((t) => t.symbol === token.symbol)!}
              />
            ))}
          </div>
        )}
      {!userTokens.loading &&
        filteredTokenList &&
        filteredTokenList.length === 0 && (
          <div className="no-tokens">
            {chrome.i18n.getMessage('popup_html_tokens_no_tokens')}
          </div>
        )}
      {userTokens.loading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent></RotatingLogoComponent>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    userTokens: state.userTokens,
    allTokens: state.tokens,
  };
};

const connector = connect(mapStateToProps, {
  loadUserTokens,
  navigateTo,
  navigateToWithParams,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
  loadTokens,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensComponent = connector(Tokens);
