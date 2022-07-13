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
import {
  loadTokens,
  loadTokensMarket,
  loadUserTokens,
} from '@popup/actions/token.actions';
import { Icons } from '@popup/icons.enum';
import { TokenItemComponent } from '@popup/pages/app-container/home/tokens/token-item/token-item.component';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { getHiveEngineTokenValue } from 'src/utils/hive-engine.utils';
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
  loadTokensMarket,
  loadTokens,
  market,
}: PropsFromRedux) => {
  const [filteredTokenList, setFilteredTokenList] = useState<TokenBalance[]>();
  const [hiddenTokens, setHiddenTokens] = useState<string[]>([]);
  const [filterValue, setFilterValue] = useState<string>('');

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
    loadTokensMarket();
    loadUserTokens(activeAccount.name!);
    setTitleContainerProperties({
      title: 'popup_html_tokens',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    if (userTokens.loading) {
      // addToLoadingList('html_popup_loading_tokens_operation');
    } else if (userTokens.list && market.length) {
      // removeFromLoadingList('html_popup_loading_tokens_operation');
      setFilteredTokenList(
        userTokens.list
          .filter((token) => !hiddenTokens.includes(token.symbol))
          .filter((token) =>
            token.symbol.toLowerCase().includes(filterValue.toLowerCase()),
          )
          .sort(
            (a, b) =>
              getHiveEngineTokenValue(b, market) -
              getHiveEngineTokenValue(a, market),
          ),
      );
    }
  }, [userTokens, market, filterValue]);

  return (
    <div className="tokens-page">
      <div
        className="disclaimer"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_view_tokens_balance'),
        }}></div>
      <div className="top-bar-container">
        {userTokens.loading && <div></div>}
        {!userTokens.loading && (
          <>
            <InputComponent
              ariaLabel="input-filter-box"
              type={InputType.TEXT}
              placeholder="popup_html_search"
              value={filterValue}
              onChange={setFilterValue}
            />

            <Icon
              onClick={() => navigateTo(Screen.TOKENS_FILTER)}
              name={Icons.FILTER}
              type={IconType.OUTLINED}
              additionalClassName="filter"></Icon>
          </>
        )}
        <Icon
          ariaLabel="tokens-settings-icon"
          onClick={() => navigateTo(Screen.TOKENS_SETTINGS)}
          name={Icons.SETTINGS}
          type={IconType.OUTLINED}
          additionalClassName="settings"></Icon>
      </div>
      {allTokens.length > 0 &&
        filteredTokenList &&
        filteredTokenList.length > 0 && (
          <div className="my-tokens" aria-label="my-tokens">
            {filteredTokenList.map((token) => (
              <TokenItemComponent
                ariaLabel="token-user-item"
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
    market: state.tokenMarket,
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
  loadTokensMarket,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensComponent = connector(Tokens);
