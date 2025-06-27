import { HiveInternalMarketLockedInOrders } from '@interfaces/hive-market.interface';
import { HiveInternalMarketUtils } from '@popup/hive/utils/hive-internal-market.utils';
import { RootState } from '@popup/multichain/store';
import { AccountValueType } from '@reference-data/account-value-type.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VscAccountBalance, VscUtils } from 'hive-keychain-commons';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const EstimatedAccountValueSection = ({
  activeAccount,
  currencyPrices,
  globalProperties,
  tokensBalance,
  tokensMarket,
  tokens,
}: PropsFromRedux) => {
  const [accountValue, setAccountValue] = useState<string | number>('...');
  const [accountValueType, setAccountValueType] = useState<AccountValueType>(
    AccountValueType.DOLLARS,
  );
  const [hiddenTokensList, setHiddenTokensList] = useState<string[]>();
  const [
    hiveMarketLockedOpenOrdersValues,
    setHiveMarketLockedOpenOrdersValues,
  ] = useState<HiveInternalMarketLockedInOrders>({ hive: 0, hbd: 0 });
  const [vscBalance, setVscBalance] = useState<VscAccountBalance>({
    account: '',
    block_height: 0,
    hbd_avg: 0,
    hbd_claim: 0,
    hbd_savings: 0,
    hive: 0,
    hive_consensus: 0,
    hbd: 0,
    hbd_modify: 0,
    pending_hbd_unstaking: 0,
  });
  useEffect(() => {
    init();
    loadHiddenTokensList();
    loadVscBalance();
  }, []);

  const loadVscBalance = async () => {
    if (activeAccount.name) {
      const balance = await VscUtils.getAccountBalance(activeAccount.name);
      setVscBalance(balance);
    }
  };

  const loadHiddenTokensList = async () => {
    const hiddenTokensList = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.HIDDEN_TOKENS,
    );
    setHiddenTokensList(hiddenTokensList ?? []);
  };

  const init = async () => {
    setAccountValueType(
      (await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.ACCOUNT_VALUE_TYPE,
      )) || AccountValueType.DOLLARS,
    );
  };

  const loadHiveInternalMarketOrders = async (username: string) => {
    setHiveMarketLockedOpenOrdersValues(
      await HiveInternalMarketUtils.getHiveInternalMarketOrders(username),
    );
  };

  useEffect(() => {
    if (activeAccount.name) {
      loadHiveInternalMarketOrders(activeAccount.name);
    }
  }, [activeAccount]);

  useEffect(() => {
    if (
      activeAccount &&
      currencyPrices &&
      globalProperties?.globals &&
      tokensBalance &&
      tokensMarket &&
      hiveMarketLockedOpenOrdersValues &&
      hiddenTokensList
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
          hiddenTokensList,
          vscBalance,
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
    hiddenTokensList,
    vscBalance,
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
