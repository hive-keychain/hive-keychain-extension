import { buildSignTxReview } from 'src/utils/sign-tx.utils';

describe('sign-tx review helper', () => {
  it('builds operation types and summaries for normal transactions', () => {
    const review = buildSignTxReview({
      ref_block_num: 1000,
      ref_block_prefix: 123456789,
      expiration: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      operations: [
        [
          'transfer',
          {
            from: 'keychain.tests',
            to: 'alice',
            amount: '1.000 HIVE',
            memo: 'hello',
          },
        ],
        [
          'custom_json',
          {
            required_posting_auths: ['keychain.tests'],
            required_auths: [],
            id: 'follow',
            json: '{"follower":"keychain.tests","following":"alice"}',
          },
        ],
      ],
      extensions: [],
    });

    expect(review).not.toBeNull();
    expect(review!.operationTypes).toEqual(['transfer', 'custom_json']);
    expect(review!.operations[0].summary).toBe(
      'Transfer 1.000 HIVE from @keychain.tests to @alice',
    );
    expect(review!.operations[1].summary).toBe(
      'Custom JSON follow using posting auth',
    );
  });

  it('flags unknown operations for explicit advanced confirmation', () => {
    const review = buildSignTxReview({
      ref_block_num: 1000,
      ref_block_prefix: 123456789,
      expiration: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      operations: [
        [
          'mystery_operation',
          {
            account: 'keychain.tests',
            amount: '1.000 HIVE',
          },
        ],
      ],
      extensions: [],
    });

    expect(review).not.toBeNull();
    expect(review!.requiresExplicitApproval).toBe(true);
    expect(review!.warningHeader).toBe(
      'Partially summarized raw transaction. Advanced confirmation is required.',
    );
    expect(review!.operations[0].summary).toBe(
      'mystery_operation (advanced operation)',
    );
  });
});
