import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface ResourceItemProps {
  icon: SVGIcons;
  label: string;
  value: string;
  tooltipText?: string;
  secondaryValue?: string;
  ariaLabel?: string;
  additionalClass?: string;
  onClick?: () => void;
}

const ResourceItem = ({
  icon,
  label,
  value,
  tooltipText,
  secondaryValue,
  ariaLabel,
  additionalClass,
  onClick,
}: PropsType) => {
  const handleOnClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <CustomTooltip
      dataTestId={`custom-tool-tip-${label}`}
      message={tooltipText}
      position="bottom"
      skipTranslation>
      <div
        data-testid={ariaLabel}
        className={`resource-item ${additionalClass ?? ''} ${
          tooltipText ? 'has-tooltip' : ''
        } ${onClick ? 'clickable' : ''}`}
        onClick={handleOnClick}>
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
