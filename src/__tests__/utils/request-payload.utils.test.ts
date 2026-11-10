import { RequestPayloadUtils } from 'src/utils/request-payload.utils';

describe('RequestPayloadUtils', () => {
  it.each([1, Number.MAX_SAFE_INTEGER])(
    'accepts positive safe request id %s',
    (requestId) => {
      expect(RequestPayloadUtils.isValidRequestId(requestId)).toBe(true);
    },
  );

  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity])(
    'rejects unsafe request id %s',
    (requestId) => {
      expect(RequestPayloadUtils.isValidRequestId(requestId)).toBe(false);
    },
  );

  it('measures UTF-8 bytes instead of JavaScript characters', () => {
    expect(RequestPayloadUtils.getJsonByteSize('é')).toBe(4);
  });

  it('rejects cyclic payloads and payloads over the limit', () => {
    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;

    expect(RequestPayloadUtils.getRequestPayloadSize(cyclic)).toEqual({
      byteSize: null,
      isValid: false,
    });
    expect(
      RequestPayloadUtils.getRequestPayloadSize(
        'a'.repeat(RequestPayloadUtils.MAX_REQUEST_BYTES - 2),
      ).isValid,
    ).toBe(true);
    expect(
      RequestPayloadUtils.getRequestPayloadSize(
        'a'.repeat(RequestPayloadUtils.MAX_REQUEST_BYTES),
      ).isValid,
    ).toBe(false);
  });
});
