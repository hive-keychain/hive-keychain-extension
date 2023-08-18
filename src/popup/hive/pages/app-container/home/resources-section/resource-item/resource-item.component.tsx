import '@common-style/home/resources-section/resource-item.component.scss';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { RootState } from 'src/popup/hive/store';

interface ResourceItemProps {
  icon: NewIcons;
  label: string;
  value: string;
  tooltipText: string;
  secondaryValue?: string;
  ariaLabel?: string;
  additionalClass?: string;
}

const ResourceItem = ({
  icon,
  label,
  value,
  tooltipText,
  secondaryValue,
  ariaLabel,
  additionalClass,
}: PropsType) => {
  return (
    <CustomTooltip
      dataTestId={`custom-tool-tip-${label}`}
      message={tooltipText}
      position="bottom"
      skipTranslation>
      <div
        data-testid={ariaLabel}
        className={`resource-item ${additionalClass ?? ''}`}>
        <SVGIcon className="icon" icon={icon} />
        <div className="right-panel">
          <div className="top">
            <div className="label">{chrome.i18n.getMessage(label)}</div>
          </div>
          <div className="bottom">
            {value}{' '}
            {secondaryValue && (
              <span className="secondary-value">{secondaryValue}</span>
            )}
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
