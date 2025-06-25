import React from 'react';
import OperationSelectUsername from 'src/common-ui/operation-select-username/operation-select-username';

type Props = {
  accounts: string[];
  username: string;
  setUsername: (username: string) => void;
};

const RequestUsername = ({ accounts, username, setUsername }: Props) => {
  return (
    <div className="select-account-section">
      <OperationSelectUsername
        accounts={accounts}
        username={username}
        setUsername={setUsername}
        label="popup_html_username"
      />
    </div>
  );
};

export default RequestUsername;
