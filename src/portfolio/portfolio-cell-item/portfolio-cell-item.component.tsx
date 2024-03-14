import { GlobalProperties } from '@interfaces/global-properties.interface';
import React from 'react';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { PortfolioUtils } from 'src/utils/porfolio.utils';

interface Props {
  item: any;
  itemKey: string;
  globalProperties: GlobalProperties | null;
}

const PortfolioCellItemComponent = ({
  item,
  itemKey,
  globalProperties,
}: Props) => {
  if (!item[itemKey]) return <div>-</div>;
  if (itemKey === 'name') {
    if (item[itemKey] === 'totals')
      return (
        <div
          className="avatar-username-container"
          key={'totals-last-row-table-totals'}>
          <div className="account-name">TOTALS</div>
        </div>
      );
    if (item[itemKey] === 'totals_usd') {
      return (
        <div
          className="avatar-username-container"
          key={'totals-last-row-table-total-usd'}>
          <div className="account-name">USD VALUE</div>
        </div>
      );
    }
    return (
      <div className="avatar-username-container" key={'avatar-username'}>
        <PreloadedImage
          className="user-picture"
          src={`https://images.hive.blog/u/${item[itemKey]}/avatar`}
          alt={'/assets/images/accounts.png'}
          placeholder={'/assets/images/accounts.png'}
        />
        <div className="account-name">{String(item[itemKey])}</div>
      </div>
    );
  } else {
    const formatedValue = PortfolioUtils.getFormatedOrDefaultValue(
      String(item[itemKey]),
      globalProperties,
    );
    return (
      <div className="text" key={`value-cell-${formatedValue}`}>
        {formatedValue}
      </div>
    );
  }
};

export default PortfolioCellItemComponent;
