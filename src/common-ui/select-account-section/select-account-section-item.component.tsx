import { LocalAccountListItem } from '@interfaces/list-item.interface';
import React, { useState } from 'react';
import { NewIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface AccountItemProps {
  isLast: boolean;
  item: LocalAccountListItem;
  selectedAccount: string;
  handleItemClicked: (value: LocalAccountListItem['value']) => void;
  closeDropdown: () => void;
}

export const SelectAccountSectionItemComponent = ({
  item,
  selectedAccount,
  isLast,
  handleItemClicked,
  closeDropdown,
}: AccountItemProps) => {
  const [hovered, setHovered] = useState<boolean>(false);

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
        {selectedAccount === item.value && (
          <SVGIcon
            icon={NewIcons.ACTIVE}
            className="active-icon"
            forceHover={hovered}
            hoverable
          />
        )}
      </div>
      {!isLast && <div className="separator"></div>}
    </div>
  );
};
