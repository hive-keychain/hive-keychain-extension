import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import './resource-item.component.scss';

interface ResourceItemProps {
  icon: string;
  label: string;
  value: string;
  tooltipText: string;
}

const ResourceItem = ({ icon, label, value, tooltipText }: PropsType) => {
  return (
    <div className="resource-item">
      <div className="top">
        <img className="icon" src={`/assets/images/${icon}.png`} />
        <div>{chrome.i18n.getMessage(label)}</div>
        <img
          className="tooltip-icon"
          src="/assets/images/info.png"
          data-for="tooltip"
          data-tip={tooltipText}
          data-iscapture="true"
        />
      </div>
      <div className="bottom">{value}</div>
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
