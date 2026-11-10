import { EvmSignatureBindingUtils } from 'src/utils/evm/evm-signature-binding.utils';

const matchingSiwe = `example.app wants you to sign in with your Ethereum account:
0x0000000000000000000000000000000000000001

URI: https://example.app/login
Version: 1
Chain ID: 1
Nonce: abc
Issued At: 2021-09-30T16:25:24Z`;

const siweContext = {
  domain: 'example.app',
  origin: 'https://example.app',
  chainId: '0x1',
};

describe('EvmSignatureBindingUtils', () => {
  describe('compareChainIds', () => {
    it('matches decimal, numeric, and hex chain ids', () => {
      expect(EvmSignatureBindingUtils.compareChainIds(1, '0x1')).toBe('match');
      expect(EvmSignatureBindingUtils.compareChainIds('1', '0x1')).toBe(
        'match',
      );
      expect(EvmSignatureBindingUtils.compareChainIds('0x1', '1')).toBe(
        'match',
      );
    });

    it('mismatches different chain ids', () => {
      expect(EvmSignatureBindingUtils.compareChainIds('0x89', '0x1')).toBe(
        'mismatch',
      );
    });

    it('returns absent for empty or unparseable chain ids', () => {
      expect(EvmSignatureBindingUtils.compareChainIds('', '0x1')).toBe(
        'absent',
      );
      expect(EvmSignatureBindingUtils.compareChainIds('nope', '0x1')).toBe(
        'absent',
      );
      expect(EvmSignatureBindingUtils.compareChainIds(undefined, '0x1')).toBe(
        'absent',
      );
    });
  });

  describe('parseSiweMessage', () => {
    it('returns null for a normal personal message', () => {
      expect(
        EvmSignatureBindingUtils.parseSiweMessage('Sign this login nonce'),
      ).toBeNull();
    });

    it('returns null when the SIWE header is missing URI or chain id', () => {
      expect(
        EvmSignatureBindingUtils.parseSiweMessage(
          'example.app wants you to sign in with your Ethereum account:\n0xabc',
        ),
      ).toBeNull();
    });

    it('parses a matching SIWE message', () => {
      expect(EvmSignatureBindingUtils.parseSiweMessage(matchingSiwe)).toEqual({
        domain: 'example.app',
        uri: 'https://example.app/login',
        uriOrigin: 'https://example.app',
        chainId: '1',
      });
    });
  });

  describe('getSiweBindingIssues', () => {
    it('returns no issues when domain, URI, and chain match', () => {
      const parsed = EvmSignatureBindingUtils.parseSiweMessage(matchingSiwe);
      expect(
        EvmSignatureBindingUtils.getSiweBindingIssues(parsed!, siweContext),
      ).toEqual([]);
    });

    it('returns a domain issue when the statement host differs and the URI matches', () => {
      const parsed = EvmSignatureBindingUtils.parseSiweMessage(
        matchingSiwe.replace(
          'example.app wants you to sign in',
          'evil.example wants you to sign in',
        ),
      );
      expect(
        EvmSignatureBindingUtils.getSiweBindingIssues(parsed!, siweContext),
      ).toEqual([
        {
          kind: 'domain',
          stated: 'evil.example',
          actual: 'example.app',
        },
      ]);
    });

    it('returns a URI issue when the sign-in origin differs', () => {
      const parsed = EvmSignatureBindingUtils.parseSiweMessage(
        matchingSiwe.replace(
          'URI: https://example.app/login',
          'URI: https://evil.example/login',
        ),
      );
      expect(
        EvmSignatureBindingUtils.getSiweBindingIssues(parsed!, siweContext),
      ).toEqual([
        {
          kind: 'uri',
          stated: 'https://evil.example/login',
          actual: 'https://example.app',
        },
      ]);
    });

    it('returns a chain issue when the SIWE chain differs', () => {
      const parsed = EvmSignatureBindingUtils.parseSiweMessage(
        matchingSiwe.replace('Chain ID: 1', 'Chain ID: 137'),
      );
      expect(
        EvmSignatureBindingUtils.getSiweBindingIssues(parsed!, siweContext),
      ).toEqual([
        {
          kind: 'chain',
          stated: '137',
          actual: '0x1',
        },
      ]);
    });

    it('treats a port on the SIWE domain as the same host', () => {
      const parsed = EvmSignatureBindingUtils.parseSiweMessage(
        matchingSiwe.replace(
          'example.app wants you to sign in',
          'example.app:443 wants you to sign in',
        ),
      );
      expect(
        EvmSignatureBindingUtils.getSiweBindingIssues(parsed!, siweContext),
      ).toEqual([]);
    });
  });

  describe('isSpendingPermitPrimaryType', () => {
    it.each([
      'Permit',
      'PermitSingle',
      'PermitBatch',
      'PermitWitnessTransferFrom',
      'PermitTransferFrom',
      'PermitBatchTransferFrom',
    ])('recognizes %s', (primaryType) => {
      expect(
        EvmSignatureBindingUtils.isSpendingPermitPrimaryType(primaryType),
      ).toBe(true);
    });

    it('does not treat ordinary typed data as a spending permit', () => {
      expect(EvmSignatureBindingUtils.isSpendingPermitPrimaryType('Mail')).toBe(
        false,
      );
    });
  });
});
