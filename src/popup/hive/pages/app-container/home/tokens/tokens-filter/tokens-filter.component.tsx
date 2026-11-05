import { Screen } from '@interfaces/screen.interface';
import { Token } from '@interfaces/tokens.interface';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import FlatList from 'flatlist-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { SafeImage } from 'src/common-ui/safe-image/safe-image.component';
import { loadTokens } from 'src/popup/hive/actions/token.actions';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

import { HtmlUtils } from 'src/utils/html.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

export const TokenFilterName = ({ name }: { name: string }) => {
  const nameRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const element = nameRef.current;
    if (!element) {
      return;
    }

    const updateTruncation = () => {
      setIsTruncated(element.scrollWidth > element.clientWidth);
    };

    updateTruncation();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(updateTruncation);
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [name]);

  return (
    <CustomTooltip
      message={isTruncated ? name : undefined}
      skipTranslation
      additionalClassName="token-filter-name-tooltip">
      <div className="name" ref={nameRef}>
        {name}
      </div>
    </CustomTooltip>
  );
};

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
          __html: HtmlUtils.getSafeI18nHtml('popup_html_tokens_settings_text'),
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
                  ariaLabel={token.symbol}
                  onChange={() => {
                    toggleHiddenToken(token.symbol);
                  }}>
                  <div
                    data-testid="token-list-item-description"
                    className="description">
                    <TokenFilterName name={token.name} />
                    <div className="extra-info">
                      <div className="details">
                        <div className="logo-container">
                          <SafeImage
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
                            {I18nUtils.getMessage('popup_token_issued_by', [
                              token.issuer,
                            ])}
                          </div>
                        )}
                      </div>
                      <div className="supply">
                        {I18nUtils.getMessage('popup_token_supply')}
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
