import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { RootState } from 'src/popup/hive/store';
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

  const onButtonClick = async () => {
    const extensionId = (await chrome.management.getSelf()).id;
    chrome.tabs.create({
      url: `chrome-extension://${extensionId}/portfolio.html`,
    });
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
          <div data-testid="estimated-account-div-value" className="value">
            {accountValue ? `$ ${accountValue}` : '...'}
          </div>
          <div
            data-testid="button-container-portfolio"
            className="button-container spacing">
            <ButtonComponent
              //TODO add labels to translate & remove skip trans
              skipLabelTranslation
              label="P"
              onClick={onButtonClick}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyPrices: state.currencyPrices,
    globalProperties: state.globalProperties,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EstimatedAccountValueSectionComponent = connector(
  EstimatedAccountValueSection,
);
