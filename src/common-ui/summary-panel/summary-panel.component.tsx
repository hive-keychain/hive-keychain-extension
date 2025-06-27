import { RootState } from '@popup/multichain/store';
import { FormatUtils } from 'hive-keychain-commons';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

interface PanelProps {
  top?: number | string;
  topLeft?: string;
  topRight?: string;
  bottom: number | string;
  bottomLeft: string;
  bottomRight: string;
  center?: number | string;
  centerLeft?: string;
  centerRight?: string;

  onBottomPanelClick?: () => void;
  onTopPanelClick?: () => void;
  onCenterPanelClick?: () => void;
}

const SummaryPanel = ({
  top,
  topLeft,
  topRight,
  bottom,
  bottomLeft,
  bottomRight,
  center,
  centerLeft,
  centerRight,
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
      {top !== null && top !== undefined && topLeft && (
        <div
          className={`current panel-row ${onTopPanelClick ? 'clickable' : ''}`}
          onClick={() => handleClickTopPanel()}>
          <div className="current-title">{chrome.i18n.getMessage(topLeft)}</div>
          <div className="current-value">
            {FormatUtils.formatCurrencyValue(
              top,
              FormatUtils.hasMoreThanXDecimal(parseFloat(top as string), 3)
                ? 8
                : 3,
            )}{' '}
            {topRight}
          </div>
        </div>
      )}
      {center && center !== undefined && centerLeft && (
        <div
          className={`current panel-row ${
            onCenterPanelClick ? 'clickable' : ''
          }`}
          onClick={handleClickCenterPanel}>
          <div className="current-title">
            {chrome.i18n.getMessage(centerLeft)}
          </div>
          <div className="current-value">
            {FormatUtils.formatCurrencyValue(
              center,
              FormatUtils.hasMoreThanXDecimal(parseFloat(top as string), 3)
                ? 8
                : 3,
            )}{' '}
            {centerRight}
          </div>
        </div>
      )}

      <div
        className={`available panel-row ${
          onBottomPanelClick ? 'clickable' : ''
        }`}
        onClick={() => handleClickBottomPanel()}>
        <div className="available-title">
          {chrome.i18n.getMessage(bottomLeft)}
        </div>
        <div className="available-value">
          {FormatUtils.formatCurrencyValue(
            bottom,
            FormatUtils.hasMoreThanXDecimal(parseFloat(bottom as string), 3)
              ? 8
              : 3,
          )}{' '}
          {bottomRight}
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
