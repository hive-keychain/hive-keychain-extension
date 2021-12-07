import React from 'react';
import Select, {
  SelectItemRenderer,
  SelectRenderer,
} from 'react-dropdown-select';
import './request-username.scss';

type Props = {
  accounts: string[];
  username: string;
  setUsername: (username: string) => void;
};

const RequestUsername = ({ accounts, username, setUsername }: Props) => {
  const customLabelRender = (selectProps: SelectRenderer<string>) => {
    return (
      <div
        className="selected-account-panel"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        <div className="selected-account-name">{username}</div>
      </div>
    );
  };
  const customItemRender = (selectProps: SelectItemRenderer<string>) => {
    return (
      <div
        className={`select-account-item ${
          username === selectProps.item ? 'selected' : ''
        }`}
        onClick={() => {
          console.log(selectProps);
          setUsername(selectProps.item);
          selectProps.methods.dropDown('close');
        }}>
        <div className="account-name">{selectProps.item}</div>
      </div>
    );
  };

  return (
    <>
      <div className="select-account-section">
        <Select
          values={[username]}
          options={accounts!}
          onChange={() => undefined}
          contentRenderer={customLabelRender}
          itemRenderer={customItemRender}
          className="select-account-select"
        />
      </div>
    </>
  );
};

export default RequestUsername;
