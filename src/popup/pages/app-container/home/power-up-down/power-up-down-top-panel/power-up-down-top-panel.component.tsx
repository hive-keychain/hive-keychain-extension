import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './power-up-down-top-panel.component.scss';

interface PanelProps {
  current?: number | string;
  available: number | string;
  currentLabel?: string;
  currentCurrency?: string;
  availableLabel: string;
  availableCurrency: string;
}

const AvailableCurrentPanel = ({
  current,
  currentLabel,
  currentCurrency,
  available,
  availableLabel,
  availableCurrency,
}: PropsType) => {
  return (
    <div className="power-up-down-top-panel">
      {current && (
        <div className="current panel-row">
          <div className="current-title">
            {chrome.i18n.getMessage(currentLabel!)}
          </div>
          <div className="current-value">
            {current} {currentCurrency}
          </div>
        </div>
      )}
      <div className="available panel-row">
        <div className="available-title">
          {chrome.i18n.getMessage(availableLabel)}
        </div>
        <div className="available-value">
          {available} {availableCurrency}
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

export const AvailableCurrentPanelComponent = connector(AvailableCurrentPanel);
