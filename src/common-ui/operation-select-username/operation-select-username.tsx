import React, { useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

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

  const handleItemClick = (selectedUsername: string) => {
    setUsername(selectedUsername);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="operation-select-username">
      {label && <div className="label">{chrome.i18n.getMessage(label)}</div>}

      <div className="select-container">
        <div className="selected-item" onClick={toggleDropdown}>
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
        </div>

        {isOpen && (
          <div className="dropdown-options">
            {accounts.map((account) => (
              <div
                key={account}
                className={`option-item ${
                  account === username ? 'selected' : ''
                }`}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationSelectUsername;
