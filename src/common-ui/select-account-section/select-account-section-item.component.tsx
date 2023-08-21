import { LocalAccountListItem } from '@interfaces/list-item.interface';
import React, { SyntheticEvent, useState } from 'react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { NewIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface AccountItemProps {
  isLast: boolean;
  item: LocalAccountListItem;
  selectedAccount: string;
  handleItemClicked: (value: LocalAccountListItem['value']) => void;
  closeDropdown: () => void;
  setInfoMessage?: (key: string, params?: string[]) => void;
  dragHandle: DraggableProvidedDragHandleProps | null | undefined;
}

export const SelectAccountSectionItemComponent = ({
  item,
  selectedAccount,
  isLast,
  handleItemClicked,
  closeDropdown,
  setInfoMessage,
  dragHandle,
}: AccountItemProps) => {
  const [hovered, setHovered] = useState<boolean>(false);

  const copyUsernameToClipboard = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    navigator.clipboard.writeText(item.value);
    if (setInfoMessage) {
      setInfoMessage('popup_html_text_copied', [item.value]);
    }
  };

  return (
    <div
      className="option"
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}>
      <div
        data-testid={`select-account-item-${item.value}`}
        className={`select-account-item ${
          selectedAccount === item.value ? 'selected' : ''
        }`}
        onClick={() => {
          handleItemClicked(item.value);
          closeDropdown();
        }}>
        <img
          className="user-picture"
          src={`https://images.hive.blog/u/${item.label}/avatar`}
          onError={(e: any) => {
            e.target.onError = null;
            e.target.src = '/assets/images/accounts.png';
          }}
        />
        <div className="account-name">{item.label}</div>
        <div className="icons-wrapper">
          {selectedAccount === item.value && !hovered && (
            <SVGIcon
              icon={NewIcons.ACTIVE}
              className="active-icon"
              forceHover={hovered}
              hoverable
            />
          )}
          {hovered && (
            <div className="hovered-icons">
              <SVGIcon
                icon={NewIcons.COPY}
                className="copy-icon"
                onClick={(event) => copyUsernameToClipboard(event)}
              />
              <span {...dragHandle}>
                <SVGIcon icon={NewIcons.DRAG} className="drag-icon" />
              </span>
            </div>
          )}
        </div>
      </div>
      {!isLast && <div className="separator"></div>}
    </div>
  );
};
