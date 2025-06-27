import { Token } from '@interfaces/tokens.interface';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import FlatList from 'flatlist-react';
import { FormatUtils } from 'hive-keychain-commons';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { loadTokens } from 'src/popup/hive/actions/token.actions';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const TokensFilter = ({
  tokens,
  loadTokens,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [filterValue, setFilterValue] = useState('');
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [hiddenTokens, setHiddenTokens] = useState<string[]>([]);
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_tokens_available',
      isBackButtonEnabled: true,
    });
    loadHiddenTokens();
    loadTokens();
  }, []);

  const loadHiddenTokens = async () => {
    setHiddenTokens(
      (await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.HIDDEN_TOKENS,
      )) ?? [],
    );
  };

  const toggleHiddenToken = (symbol: string) => {
    let newHiddenTokens = hiddenTokens;
    if (hiddenTokens.includes(symbol)) {
      newHiddenTokens = newHiddenTokens.filter(
        (hiddenToken) => hiddenToken !== symbol,
      );
    } else {
      newHiddenTokens = [...newHiddenTokens, symbol];
    }
    setHiddenTokens(newHiddenTokens);
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.HIDDEN_TOKENS,
      newHiddenTokens,
    );
  };

  useEffect(() => {
    if (tokens) {
      const filterValueLowerCase = filterValue.toLowerCase();
      setFilteredTokens(
        tokens.filter(
          (token) =>
            token.name.toLowerCase().includes(filterValueLowerCase) ||
            token.symbol.toLowerCase().includes(filterValueLowerCase) ||
            token.issuer.toLowerCase().includes(filterValueLowerCase),
        ),
      );
    }
  }, [tokens, filterValue]);

  return (
    <div data-testid={`${Screen.TOKENS_FILTER}-page`} className="tokens-filter">
      <div
        data-testid="tokens-filter-disclaimer"
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_tokens_settings_text'),
        }}></div>

      <InputComponent
        classname="input-filter"
        dataTestId="input-filter-box"
        type={InputType.TEXT}
        placeholder="popup_html_search"
        value={filterValue}
        onChange={setFilterValue}
        rightActionIcon={SVGIcons.INPUT_SEARCH}
        rightActionClicked={() => {}}
      />

      <div className="tokens-list">
        {filteredTokens.length ? (
          <FlatList
            list={filteredTokens}
            renderItem={(token: Token) => (
              <div
                data-testid={`token-list-item-${token.symbol}`}
                className="token"
                key={token.symbol}>
                <CheckboxPanelComponent
                  dataTestId={`checkbox-select-token-${token.symbol}`}
                  extraDataTestIdOnInput={`checkbox-checked-${token.symbol}`}
                  checked={!hiddenTokens.includes(token.symbol)}
                  onChange={() => {
                    toggleHiddenToken(token.symbol);
                  }}>
                  <div
                    data-testid="token-list-item-description"
                    className="description">
                    <div className="name">{token.name}</div>
                    <div className="extra-info">
                      <div className="details">
                        <div className="logo-container">
                          <img
                            className="logo"
                            src={
                              token.metadata.icon ??
                              '/assets/images/wallet/hive-engine.svg'
                            }
                            onError={({ currentTarget }) => {
                              currentTarget.onerror = null;
                              currentTarget.src =
                                '/assets/images/wallet/hive-engine.svg';
                            }}
                          />
                        </div>
                        {token.issuer && (
                          <div className="issued-by">
                            {token.symbol}{' '}
                            {chrome.i18n.getMessage('popup_token_issued_by', [
                              token.issuer,
                            ])}
                          </div>
                        )}
                      </div>
                      <div className="supply">
                        {chrome.i18n.getMessage('popup_token_supply')}
                        {' : '}
                        {FormatUtils.nFormatter(parseFloat(token.supply), 3)}/
                        {FormatUtils.nFormatter(parseFloat(token.maxSupply), 3)}
                      </div>
                    </div>
                  </div>
                </CheckboxPanelComponent>
              </div>
            )}
            renderOnScroll
          />
        ) : null}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
    tokens: state.hive.tokens as Token[],
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  loadTokens,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensFilterComponent = connector(TokensFilter);
