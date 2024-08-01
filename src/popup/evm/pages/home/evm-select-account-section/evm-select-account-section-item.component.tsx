import { LocalAccountListItem } from '@interfaces/list-item.interface';
import { identicon } from 'minidenticons';
import React, { SyntheticEvent, useState } from 'react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import FormatUtils from 'src/utils/format.utils';

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

export const EvmSelectAccountSectionItemComponent = ({
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
      onMouseLeave={() => setHovered(true)}>
      <div
        data-testid={`select-account-item-${item.value}`}
        className={`select-account-item ${
          selectedAccount === item.value ? 'selected' : ''
        }`}
        onClick={() => {
          handleItemClicked(item.value);
          closeDropdown();
        }}>
        <div
          className="user-picture"
          dangerouslySetInnerHTML={{
            __html: identicon(item.label, 90, 50),
          }}
        />
        <div className="account-name pipou">
          {FormatUtils.shortenString(item.label, 4)}
          {renderCheckedAccount()}
        </div>
      </div>
      {!isLast && <div className="separator"></div>}
    </div>
  );
};
