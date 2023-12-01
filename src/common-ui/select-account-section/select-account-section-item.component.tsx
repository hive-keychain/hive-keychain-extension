import { LocalAccountListItem } from '@interfaces/list-item.interface';
import React, { SyntheticEvent, useState } from 'react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { NewIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface AccountItemProps {
  isLast: boolean;
  item: LocalAccountListItem;
  selectedAccount: string;
  handleItemClicked: (value: LocalAccountListItem['value']) => void;
  closeDropdown: () => void;
  setInfoMessage?: (key: string, params?: string[]) => void;
  dragHandle: DraggableProvidedDragHandleProps | null | undefined;
  isOnMain: boolean;
}

export const SelectAccountSectionItemComponent = ({
  item,
  selectedAccount,
  isLast,
  handleItemClicked,
  closeDropdown,
  setInfoMessage,
  dragHandle,
  isOnMain,
}: AccountItemProps) => {
  const [hovered, setHovered] = useState<boolean>(false);

  const copyUsernameToClipboard = async (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    await navigator.clipboard.writeText(item.value);
    closeDropdown();
    if (setInfoMessage) {
      setInfoMessage('popup_html_text_copied', [item.value]);
    }
  };
  const renderCheckedAccount = () => {
    if (isOnMain)
      return (
        <div className="icons-wrapper">
          {selectedAccount === item.value && !hovered && (
            <SVGIcon
              icon={NewIcons.SELECT_ACTIVE}
              className="active-icon"
              forceHover={hovered}
              hoverable
            />
          )}
          {hovered && (
            <div className="hovered-icons">
              <SVGIcon
                icon={NewIcons.SELECT_COPY}
                className="copy-icon"
                onClick={(event) => copyUsernameToClipboard(event)}
              />
              <span {...dragHandle}>
                <SVGIcon icon={NewIcons.SELECT_DRAG} className="drag-icon" />
              </span>
            </div>
          )}
        </div>
      );
    else if (selectedAccount === item.value)
      return (
        <SVGIcon
          icon={NewIcons.SELECT_ACTIVE}
          className="active-icon"
          forceHover={hovered}
          hoverable
        />
      );
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
        <PreloadedImage
          className="user-picture"
          src={`https://images.hive.blog/u/${item.label}/avatar`}
          alt={'/assets/images/accounts.png'}
        />
        <div className="account-name">{item.label}</div>
        {renderCheckedAccount()}
      </div>
      {!isLast && <div className="separator"></div>}
    </div>
  );
};
