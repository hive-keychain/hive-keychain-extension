import { HDNodeWallet } from 'ethers';

export type WalletWithBalance = {
  wallet: HDNodeWallet;
  balance: number;
  selected: boolean;
};
