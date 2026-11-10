import { SVGIcons } from '@common-ui/icons.enum';
import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import React, { useRef, useState } from 'react';

interface Props {
  setFilterValue: (newValue: string) => void;
  filterValue: string;
  leftIcon?: SVGIcons;
  rightAction?: {
    icon: SVGIcons;
    onClick: (...args: any[]) => void;
  };
  filterDisabled?: boolean;
}

export const SeparatorWithFilter = ({
  setFilterValue,
  filterValue,
  leftIcon,
  rightAction,
  filterDisabled,
}: Props) => {
  const [showSearch, setShowSearch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="separator-with-filter">
      {leftIcon && (
        <span>
          <SVGIcon icon={leftIcon} className="no-pointer" />
        </span>
      )}
      {!showSearch && <div className="line" />}

      <InputComponent
        classname={`search-bar ${showSearch ? '' : 'hide'}`}
        type={InputType.TEXT}
        placeholder="popup_html_search"
        onChange={setFilterValue}
        value={filterValue}
        rightActionIcon={SVGIcons.WALLET_SEARCH}
        rightActionClicked={() => {
          setShowSearch(false);
        }}
        ref={inputRef}
      />

      {!filterDisabled && (
        <SVGIcon
          icon={SVGIcons.WALLET_SEARCH}
          className={`search-icon ${!showSearch ? '' : 'hide'}`}
          onClick={() => {
            setShowSearch(true);
            setTimeout(() => {
              inputRef.current?.focus();
            }, 200);
          }}
        />
      )}
      {rightAction && (
        <SVGIcon
          icon={rightAction.icon}
          className={`right-action-icon`}
          onClick={() => {
            rightAction.onClick();
          }}
        />
      )}
    </div>
  );
};
