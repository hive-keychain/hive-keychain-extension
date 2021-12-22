import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import './resource-item.component.scss';

interface ResourceItemProps {
  icon: Icons;
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
    <div
      className="resource-item"
      data-for="tooltip"
      data-tip={tooltipText}
      data-iscapture="true">
      <span className="material-icons icon">{icon}</span>
      <div className="right-panel">
        <div className="top">
          <div className="label">{chrome.i18n.getMessage(label)}</div>
        </div>
        <div className="bottom">
          {value} {secondaryValue && `(${secondaryValue})`}
        </div>
      </div>
      <ReactTooltip
        id="tooltip"
        place="top"
        type="light"
        effect="solid"
        multiline={true}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsType = ConnectedProps<typeof connector> & ResourceItemProps;

export const ResourceItemComponent = connector(ResourceItem);
