export type HiveUriOperation =
  | ['transfer', { to: string; amount: string; memo: string }]
  | ['account_witness_proxy', { proxy: string }]
  | ['account_witness_vote', { witness: string; approve: boolean }]
  | ['delegate_vesting_shares', { delegatee: string; vesting_shares: string }]
  | [
      'update_proposal_votes',
      { proposal_ids: number[]; approve: boolean; extensions: any[] },
    ]
  | [
      'recurrent_transfer',
      {
        to: string;
        amount: string;
        memo: string;
        recurrence: string;
        executions: string;
        extensions: any[];
      },
    ];

export type HiveUriTransaction = {
  tx: {
    ref_block_num: string;
    ref_block_prefix: string;
    expiration: string;
    extensions: any[];
    operations: HiveUriOperation[];
  };
  params: Record<string, unknown>;
};
