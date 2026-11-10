import { ImageUrlUtils } from 'src/utils/image-url.utils';

describe('image-url.utils', () => {
  const { getSafeImageUrl } = ImageUrlUtils;

  it('accepts a public HTTPS image URL', () => {
    expect(getSafeImageUrl(' https://cdn.example.com/logo.png ')).toBe(
      'https://cdn.example.com/logo.png',
    );
  });

  it('rejects credentials, http, and javascript URLs', () => {
    expect(getSafeImageUrl('https://user:pass@cdn.example.com/a.png')).toBeUndefined();
    expect(getSafeImageUrl('http://cdn.example.com/a.png')).toBeUndefined();
    expect(getSafeImageUrl('javascript:alert(1)')).toBeUndefined();
  });

  it('rejects private hosts, including a trailing root dot', () => {
    expect(getSafeImageUrl('https://127.0.0.1/logo.png')).toBeUndefined();
    expect(getSafeImageUrl('https://localhost/logo.png')).toBeUndefined();
    expect(getSafeImageUrl('https://localhost./logo.png')).toBeUndefined();
    expect(getSafeImageUrl('https://metadata.google.internal./logo.png')).toBeUndefined();
    expect(getSafeImageUrl('https://printer.local./logo.png')).toBeUndefined();
    expect(getSafeImageUrl('https://10.0.0.1.example.com/logo.png')).toBeUndefined();
  });

  it('rejects hostnames that resolve through known rebinding suffixes', () => {
    expect(getSafeImageUrl('https://127.0.0.1.nip.io/logo.png')).toBeUndefined();
    expect(getSafeImageUrl('https://app.localtest.me/logo.png')).toBeUndefined();
    expect(getSafeImageUrl('https://8.8.8.8.sslip.io/logo.png')).toBeUndefined();
  });

  it('keeps a public hostname that only has a trailing dot', () => {
    expect(getSafeImageUrl('https://cdn.example.com./logo.png')).toBe(
      'https://cdn.example.com./logo.png',
    );
  });

  it('accepts a bounded image data URL and rejects other data URLs', () => {
    expect(
      getSafeImageUrl('data:image/png;base64,aaaa'),
    ).toBe('data:image/png;base64,aaaa');
    expect(getSafeImageUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined();
  });
});
