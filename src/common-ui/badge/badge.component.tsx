import React from 'react';

export enum BadgeType {
  EXPERIMENTAL = 'experimental',
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
}
type Props = {
  badgeType: BadgeType;
  small?: boolean;
};
export const Badge = ({ badgeType, small }: Props) => {
  const label = `common_${badgeType}`;
  return (
    <div className={`badge ${badgeType} ${small && 'small'}`}>
      {chrome.i18n.getMessage(label)}
    </div>
  );
};
