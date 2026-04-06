import { LocalAccountListItem } from '@interfaces/list-item.interface';
import React, { SyntheticEvent, useState } from 'react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';

interface AccountItemProps {
  isLast: boolean;
  item: LocalAccountListItem;
  selectedAccount: string;
  handleItemClicked: (value: LocalAccountListItem['value']) => void;
  closeDropdown: () => void;
  dragHandle: DraggableProvidedDragHandleProps | null | undefined;
  isOnMain: boolean;
}

export const SelectAccountSectionItemComponent = ({
  item,
  selectedAccount,
  isLast,
  handleItemClicked,
  closeDropdown,
  dragHandle,
  isOnMain,
}: AccountItemProps) => {
  const [hovered, setHovered] = useState<boolean>(false);

  const copyUsernameToClipboard = async (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    closeDropdown();
    void copyTextWithToast(item.value, COPY_GENERIC_MESSAGE_KEY);
  };
  const renderCheckedAccount = () => {
    if (isOnMain)
      return (
        <div className="icons-wrapper">
          {selectedAccount === item.value && !hovered && (
            <SVGIcon
              icon={SVGIcons.SELECT_ACTIVE}
              className="active-icon"
              forceHover={hovered}
              hoverable
            />
          )}
          {hovered && (
            <div
              className={`hovered-icons ${
                process.env.IS_FIREFOX ? 'firefox' : ''
              }`}>
              <div onClick={(event) => copyUsernameToClipboard(event)}>
                <PreloadedImage
                  className={'copy-icon'}
                  src={`/assets/images/select/copy.svg`}
                />
              </div>
              {!process.env.IS_FIREFOX && (
                <span {...dragHandle}>
                  <SVGIcon icon={SVGIcons.SELECT_DRAG} className="drag-icon" />
                </span>
              )}
            </div>
          )}
        </div>
      );
    else if (selectedAccount === item.value)
      return (
        <SVGIcon
          icon={SVGIcons.SELECT_ACTIVE}
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
          alt={'/assets/images/placeholders/account-placeholder.png'}
          placeholder={'/assets/images/placeholders/account-placeholder.png'}
        />
        <div className="account-name">{item.label}</div>
        {renderCheckedAccount()}
      </div>
      {!isLast && <div className="separator"></div>}
    </div>
  );
};
