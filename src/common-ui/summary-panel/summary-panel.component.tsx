import { CurrentWithdrawingListItem } from '@interfaces/list-item.interface';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { BaseCurrencies } from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import './summary-panel.component.scss';

interface PanelProps {
  top?: number | string;
  topLeft?: string;
  topRight?: string;
  bottom: number | string;
  bottomLeft: string;
  bottomRight: string;

  currentWithdrawingList?: CurrentWithdrawingListItem[];
  centerLabel?: string;
  onBottomPanelClick?: () => void;
  onTopPanelClick?: () => void;
  onCenterPanelClick?: () => void;
}

const SummaryPanel = ({
  top: current, // TODO make sure there is no more reference to current, available etc
  topLeft: currentLabel,
  topRight: currentCurrency,
  bottom: available,
  bottomLeft: availableLabel,
  bottomRight: availableCurrency,
  centerLabel: currentWithdrawLabel,
  currentWithdrawingList,
  onBottomPanelClick,
  onTopPanelClick,
  onCenterPanelClick,
}: PropsType) => {
  const handleClickTopPanel = () => {
    if (onTopPanelClick) {
      onTopPanelClick();
    }
  };

  const handleClickBottomPanel = () => {
    if (onBottomPanelClick) {
      onBottomPanelClick();
    }
  };

  const handleClickCenterPanel = () => {
    if (onCenterPanelClick) {
      onCenterPanelClick();
    }
  };

  return (
    <div className="summary-panel">
      {current !== null && current !== undefined && currentLabel && (
        <div
          className={`current panel-row ${onTopPanelClick ? 'clickable' : ''}`}
          onClick={() => handleClickTopPanel()}>
          <div className="current-title">
            {chrome.i18n.getMessage(currentLabel)}
          </div>
          <div className="current-value">
            {FormatUtils.formatCurrencyValue(
              current,
              FormatUtils.hasMoreThanXDecimal(parseFloat(current as string), 3)
                ? 8
                : 3,
            )}{' '}
            {currentCurrency}
          </div>
        </div>
      )}
      {currentWithdrawingList &&
        currentWithdrawingList?.length > 0 &&
        currentWithdrawLabel && (
          <div
            className={`current panel-row ${
              onCenterPanelClick ? 'clickable' : ''
            }`}
            onClick={handleClickCenterPanel}>
            <div className="current-title">
              {chrome.i18n.getMessage(currentWithdrawLabel)}
            </div>
            <div className="current-value">
              {FormatUtils.formatCurrencyValue(
                currentWithdrawingList.reduce(
                  (acc, curr) => acc + parseFloat(curr.amount.split(' ')[0]),
                  0,
                ),
                3,
              )}{' '}
              {BaseCurrencies.HBD.toUpperCase()}
            </div>
          </div>
        )}
      <div
        className={`available panel-row ${
          onBottomPanelClick ? 'clickable' : ''
        }`}
        onClick={() => handleClickBottomPanel()}>
        <div className="available-title">
          {chrome.i18n.getMessage(availableLabel)}
        </div>
        <div className="available-value">
          {FormatUtils.formatCurrencyValue(
            available,
            FormatUtils.hasMoreThanXDecimal(parseFloat(available as string), 3)
              ? 8
              : 3,
          )}{' '}
          {availableCurrency}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsType = ConnectedProps<typeof connector> & PanelProps;

export const SummaryPanelComponent = connector(SummaryPanel);
