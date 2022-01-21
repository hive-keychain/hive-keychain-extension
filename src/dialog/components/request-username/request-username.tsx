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
  const accountsList = accounts.map((e) => ({ label: e, value: e }));

  //TODO : Fix dropdown
  const customLabelRender = (
    selectProps: SelectRenderer<typeof accountsList[0]>,
  ) => {
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

  const customItemRender = (
    selectProps: SelectItemRenderer<typeof accountsList[0]>,
  ) => {
    return (
      <div>
        <div className="account-name">{selectProps.item.label}</div>
      </div>
    );
  };
  if (!accountsList.length) return null;

  return (
    <div className="select-account-section">
      <Select
        values={[{ label: username, value: username }]}
        options={accountsList!}
        onChange={(e) => {
          setUsername(e[0].value);
        }}
        contentRenderer={customLabelRender}
        className="select-account-select"
      />
    </div>
  );
};

export default RequestUsername;
