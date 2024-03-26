import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';

const EstimatedAccountValueSection = ({
  activeAccount,
  currencyPrices,
  globalProperties,
}: PropsFromRedux) => {
  const [accountValue, setAccountValue] = useState<string | number>('...');
  useEffect(() => {
    setAccountValue(
      AccountUtils.getAccountValue(
        activeAccount.account,
        currencyPrices,
        globalProperties.globals!,
      ),
    );
  }, [activeAccount, currencyPrices, globalProperties]);

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
        <div data-testid="estimated-account-div-value" className="value">
          {accountValue ? `$ ${accountValue}` : '...'}
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
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EstimatedAccountValueSectionComponent = connector(
  EstimatedAccountValueSection,
);
