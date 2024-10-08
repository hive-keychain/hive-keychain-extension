import { HiveInternalMarketLockedInOrders } from '@interfaces/hive-market.interface';
import { AccountValueType } from '@reference-data/account-value-type.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export interface DisplayedAccountValues {
  [AccountValueType.DOLLARS]: string;
  [AccountValueType.TOKEN]: string;
}

interface EstimatedAccountValueSectionProps {
  hasPortofolio?: boolean;
  accountValues: DisplayedAccountValues;
}

const EstimatedAccountValueSection = ({
  hasPortofolio,
  accountValues,
}: EstimatedAccountValueSectionProps) => {
  const [accountValueType, setAccountValueType] = useState<AccountValueType>(
    AccountValueType.DOLLARS,
  );
  const [hiddenTokensList, setHiddenTokensList] = useState<string[]>();
  const [
    hiveMarketLockedOpenOrdersValues,
    setHiveMarketLockedOpenOrdersValues,
  ] = useState<HiveInternalMarketLockedInOrders>({ hive: 0, hbd: 0 });

  useEffect(() => {
    init();
    loadHiddenTokensList();
  }, []);

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

  const openPortfolio = async () => {
    chrome.tabs.create({
      url: `portfolio.html`,
    });
  };

  const onClickEstimatedValue = () => {
    const newAccountValueType =
      accountValueType === AccountValueType.DOLLARS
        ? AccountValueType.TOKEN
        : accountValueType === AccountValueType.TOKEN
        ? AccountValueType.HIDDEN
        : AccountValueType.DOLLARS;
    setAccountValueType(newAccountValueType);
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.ACCOUNT_VALUE_TYPE,
      newAccountValueType,
    );
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
          <div
            data-testid="estimated-account-div-value"
            className={`value ${
              accountValueType === AccountValueType.HIDDEN ? 'with-margin' : ''
            }`}
            onClick={onClickEstimatedValue}>
            {accountValueType !== AccountValueType.HIDDEN
              ? `${accountValues[accountValueType]}`
              : '...'}
          </div>
          {hasPortofolio && (
            <SVGIcon
              className={`portfolio-icon `}
              icon={SVGIcons.PORTOLIO}
              onClick={openPortfolio}
            />
          )}
        </div>
      </div>
    </>
  );
};

export const EstimatedAccountValueSectionComponent =
  EstimatedAccountValueSection;
