import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import './resource-item.component.scss';

interface ResourceItemProps {
  icon: Icons | string;
  label: string;
  value: string;
  tooltipText: string;
  secondaryValue?: string;
}

const ResourceItem = ({
  icon,
  label,
  value,
  tooltipText,
  secondaryValue,
}: PropsType) => {
  return (
    <CustomTooltip message={tooltipText} skipTranslation>
      <div className="resource-item">
        <Icon
          name={icon}
          type={IconType.STROKED}
          additionalClassName="icon"></Icon>
        <div className="right-panel">
          <div className="top">
            <div className="label">{chrome.i18n.getMessage(label)}</div>
          </div>
          <div className="bottom">
            {value} {secondaryValue && `(${secondaryValue})`}
          </div>
        </div>
      </div>
    </CustomTooltip>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsType = ConnectedProps<typeof connector> & ResourceItemProps;

export const ResourceItemComponent = connector(ResourceItem);
