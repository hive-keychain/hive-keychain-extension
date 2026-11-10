import React, { useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

import { I18nUtils } from 'src/utils/i18n.utils';

let operationSelectUsernameId = 0;

type Props = {
  accounts: string[];
  username: string;
  setUsername: (username: string) => void;
  label?: string;
};

const OperationSelectUsername = ({
  accounts,
  username,
  setUsername,
  label,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeOptionIndex, setActiveOptionIndex] = useState<number>();
  const [selectId] = useState(
    () => `operation-select-username-${++operationSelectUsernameId}`,
  );
  const optionsId = `${selectId}-options`;

  const openDropdown = () => {
    setActiveOptionIndex(Math.max(accounts.indexOf(username), 0));
    setIsOpen(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setActiveOptionIndex(undefined);
  };

  const handleItemClick = (selectedUsername: string) => {
    setUsername(selectedUsername);
    closeDropdown();
  };

  const toggleDropdown = () => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const handleSelectedItemKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      closeDropdown();
      return;
    }

    if (event.key === 'Tab') {
      closeDropdown();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isOpen) {
        openDropdown();
      } else if (activeOptionIndex !== undefined) {
        handleItemClick(accounts[activeOptionIndex]);
      }
      return;
    }

    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    if (!isOpen) {
      openDropdown();
      return;
    }

    setActiveOptionIndex((currentIndex = 0) => {
      if (event.key === 'Home') {
        return 0;
      }
      if (event.key === 'End') {
        return accounts.length - 1;
      }
      return (
        (currentIndex + (event.key === 'ArrowDown' ? 1 : -1) +
          accounts.length) % accounts.length
      );
    });
  };

  return (
    <div className="operation-select-username">
      {label && <div className="label">{I18nUtils.getMessage(label)}</div>}

      <div className="select-container">
        <button
          id={selectId}
          className="selected-item"
          type="button"
          role="combobox"
          aria-label={I18nUtils.getMessage(label ?? 'popup_html_username')}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? optionsId : undefined}
          aria-activedescendant={
            isOpen && activeOptionIndex !== undefined
              ? `${optionsId}-option-${activeOptionIndex}`
              : undefined
          }
          onKeyDown={handleSelectedItemKeyDown}
          onClick={toggleDropdown}>
          <PreloadedImage
            className="user-avatar"
            src={`https://images.hive.blog/u/${username}/avatar`}
            alt={'/assets/images/accounts.png'}
            placeholder={'/assets/images/accounts.png'}
          />
          <span className="username">{username}</span>
          <SVGIcon
            className="dropdown-arrow"
            icon={
              isOpen ? SVGIcons.SELECT_ARROW_UP : SVGIcons.SELECT_ARROW_DOWN
            }
          />
        </button>

        {isOpen && (
          <div id={optionsId} className="dropdown-options" role="listbox">
            {accounts.map((account, index) => (
              <button
                id={`${optionsId}-option-${index}`}
                key={account}
                className={`option-item ${
                  account === username ? 'selected' : ''
                } ${index === activeOptionIndex ? 'keyboard-active' : ''}`}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={account === username}
                onClick={() => handleItemClick(account)}>
                <PreloadedImage
                  className="user-avatar"
                  src={`https://images.hive.blog/u/${account}/avatar`}
                  alt={'/assets/images/accounts.png'}
                  placeholder={'/assets/images/accounts.png'}
                />
                <span className="username">{account}</span>
                {account === username && (
                  <SVGIcon
                    icon={SVGIcons.SELECT_ACTIVE}
                    className="active-icon"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationSelectUsername;
