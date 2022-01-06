import React, { useEffect, useState } from 'react';
import RequestItem from 'src/dialog/components/request-item/request-item';

type Props = {
  amount: number;
  currency: string;
  username: string;
  testnet: boolean;
};

const RequestBalance = ({}: Props) => {
  const [balance, setBalance] = useState('...');
  useEffect(() => {}, []);
  return <RequestItem title="dialog_balance" content={balance} />;
};

export default RequestBalance;
