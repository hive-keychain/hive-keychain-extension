import { EvmLocalAccountListItem } from '@interfaces/list-item.interface';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import React, { SyntheticEvent, useState } from 'react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { EvmAccountImage } from 'src/common-ui/evm/evm-account-image/evm-account-image.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import FormatUtils from 'src/utils/format.utils';

interface AccountItemProps {
  isLast: boolean;
  item: EvmLocalAccountListItem;
  selectedAccount: string;
  handleItemClicked: (
    value: EvmLocalAccountListItem['value']['wallet']['address'],
  ) => void;
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
    await navigator.clipboard.writeText(item.value.wallet.address);
    closeDropdown();
    if (setInfoMessage) {
      setInfoMessage('popup_html_text_copied', [item.value.wallet.address]);
    }
  };
  const renderCheckedAccount = () => {
    if (isOnMain)
      return (
        <div className="icons-wrapper">
          {selectedAccount === item.value.wallet.address && !hovered && (
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
    else if (selectedAccount === item.value.wallet.address)
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
          selectedAccount === item.value.wallet.address ? 'selected' : ''
        }`}
        onClick={() => {
          handleItemClicked(item.value.wallet.address!);
          closeDropdown();
        }}>
        <EvmAccountImage address={item.label} />
        <div
          className="selected-account-name"
          data-testid="selected-account-name">
          <div className="seed-name">
            {EvmAccountUtils.getSeedName(item.value)}
          </div>
          <div className="address-name">
            {item.value?.nickname ?? 'No name'}
          </div>
          <div className="address">
            {FormatUtils.shortenString(item.value?.wallet.address!, 4)}
          </div>
        </div>
        {renderCheckedAccount()}
      </div>
      {!isLast && <div className="separator"></div>}
    </div>
  );
};
