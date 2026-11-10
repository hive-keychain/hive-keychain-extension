import React from 'react';

import { I18nUtils } from 'src/utils/i18n.utils';
export enum BadgeType {
  EXPERIMENTAL = 'experimental',
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
  PENDING = 'pending',
}
type Props = {
  badgeType: BadgeType;
  small?: boolean;
  inverted?: boolean;
};
export const Badge = ({ badgeType, small, inverted }: Props) => {
  const label = `common_${badgeType}`;
  return (
    <div
      className={`badge ${badgeType} ${small && 'small'} ${
        inverted && 'inverted'
      }`}>
      {I18nUtils.getMessage(label)}
    </div>
  );
};
