import { PowerType } from '@popup/pages/app-container/home/power-up-down/power-type.enum';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import CurrencyUtils from 'src/utils/currency.utils';
import './power-up-down-top-panel.component.scss';

interface PanelProps {
  current: number | string;
  available: number | string;
  powerType: PowerType;
}

const PowerUpDownTopPanel = ({
  currencyLabels,
  current,
  available,
  powerType,
}: PropsType) => {
  return (
    <div className="power-up-down-top-panel">
      <div className="current panel-row">
        <div className="current-title">
          {chrome.i18n.getMessage('popup_html_current')}
        </div>
        <div className="current-value">
          {current}{' '}
          {powerType === PowerType.POWER_UP
            ? currencyLabels.hp
            : currencyLabels.hive}
        </div>
      </div>
      <div className="available panel-row">
        <div className="available-title">
          {chrome.i18n.getMessage('popup_html_available')}
        </div>
        <div className="available-value">
          {available}{' '}
          {powerType === PowerType.POWER_UP
            ? currencyLabels.hive
            : currencyLabels.hp}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
  };
};

const connector = connect(mapStateToProps, {});
type PropsType = ConnectedProps<typeof connector> & PanelProps;

export const PowerUpDownTopPanelComponent = connector(PowerUpDownTopPanel);
