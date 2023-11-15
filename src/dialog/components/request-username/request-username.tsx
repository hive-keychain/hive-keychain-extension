import React from 'react';
import { ComplexeCustomSelect } from 'src/common-ui/custom-select/custom-select.component';

type Props = {
  accounts: string[];
  username: string;
  setUsername: (username: string) => void;
};

const RequestUsername = ({ accounts, username, setUsername }: Props) => {
  const accountsList = accounts.map((e) => ({ label: e, value: e }));

  return (
    <div className="select-account-section">
      <ComplexeCustomSelect
        selectedItem={{ label: username, value: username }}
        options={accountsList}
        setSelectedItem={(item) => setUsername(item.value)}
        label="popup_html_username"
        background="white"
      />
    </div>
  );
};

export default RequestUsername;
