import { HiveInternalMarketLockedInOrders } from '@popup/hive/utils/hive-internal-market.utils';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export enum AccountValueType {
  DOLLARS = 'DOLLARS',
  HIVE = 'HIVE',
  HIDDEN = 'HIDDEN',
}

interface Props {
  hiveMarketLockedOpenOrdersValues: HiveInternalMarketLockedInOrders;
}
const EstimatedAccountValueSection = ({
  activeAccount,
  currencyPrices,
  globalProperties,
  tokensBalance,
  tokensMarket,
  tokens,
  hiveMarketLockedOpenOrdersValues,
}: PropsFromRedux & Props) => {
  const [accountValue, setAccountValue] = useState<string | number>('...');
  const [accountValueType, setAccountValueType] = useState<AccountValueType>(
    AccountValueType.DOLLARS,
  );
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setAccountValueType(
      (await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.ACCOUNT_VALUE_TYPE,
      )) || AccountValueType.DOLLARS,
    );
  };

  useEffect(() => {
    if (
      activeAccount &&
      currencyPrices &&
      globalProperties?.globals &&
      tokensBalance &&
      tokensMarket &&
      hiveMarketLockedOpenOrdersValues
    ) {
      setAccountValue(
        AccountUtils.getAccountValue(
          activeAccount.account,
          currencyPrices,
          globalProperties.globals!,
          tokensBalance,
          tokensMarket,
          accountValueType,
          tokens,
          hiveMarketLockedOpenOrdersValues,
        ),
      );
    }
  }, [
    activeAccount,
    currencyPrices,
    globalProperties,
    tokensBalance,
    tokensMarket,
    accountValueType,
    hiveMarketLockedOpenOrdersValues,
  ]);

  const openPortfolio = async () => {
    chrome.tabs.create({
      url: `portfolio.html`,
    });
  };

  const onClickEstimatedValue = () => {
    const newAccountValueType =
      accountValueType === AccountValueType.DOLLARS
        ? AccountValueType.HIVE
        : accountValueType === AccountValueType.HIVE
        ? AccountValueType.HIDDEN
        : AccountValueType.DOLLARS;
    setAccountValueType(newAccountValueType);
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.ACCOUNT_VALUE_TYPE,
      newAccountValueType,
    );
  };
  const getPrefix = () => {
    return accountValueType === AccountValueType.DOLLARS ? '$' : '';
  };
  const getSuffix = () => {
    return accountValueType === AccountValueType.HIVE ? 'HIVE' : '';
  };

  return (
    <>
      <div className="estimated-account-value-section">
        <div className="label-panel">
          <CustomTooltip
            dataTestId="custom-tool-tip-estimated-value-section"
            message="popup_html_estimation_info_text"
            delayShow={500}
            position="bottom">
            <div className="label">
              {chrome.i18n.getMessage('popup_html_estimation')}
            </div>
          </CustomTooltip>
        </div>
        <div className="estimated-value-button-container">
          {' '}
          <div
            data-testid="estimated-account-div-value"
            className={`value ${
              accountValueType === AccountValueType.HIDDEN ? 'with-margin' : ''
            }`}
            onClick={onClickEstimatedValue}>
            {accountValue
              ? `${getPrefix()} ${accountValue} ${getSuffix()}`
              : '...'}
          </div>
          <SVGIcon
            className={`portfolio-icon `}
            icon={SVGIcons.PORTOLIO}
            onClick={openPortfolio}
          />
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
    currencyPrices: state.hive.currencyPrices,
    globalProperties: state.hive.globalProperties,
    tokensBalance: state.hive.userTokens.list,
    tokensMarket: state.hive.tokenMarket,
    tokens: state.hive.tokens,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EstimatedAccountValueSectionComponent = connector(
  EstimatedAccountValueSection,
);
