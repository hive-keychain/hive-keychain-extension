const ISO_COUNTRY_FLAG_BASE_CODE_POINT = 0x1f1e6;
const ASCII_UPPERCASE_A_CODE_POINT = 65;

export const getIsoCountryFlagEmoji = (code: string): string => {
  const normalized = code.trim().toUpperCase();
  if (normalized.length !== 2 || /[^A-Z]/.test(normalized)) {
    return '';
  }

  return String.fromCodePoint(
    ...[...normalized].map(
      (char) =>
        ISO_COUNTRY_FLAG_BASE_CODE_POINT +
        char.charCodeAt(0) -
        ASCII_UPPERCASE_A_CODE_POINT,
    ),
  );
};

export const IsoCountryCodeUtils = {
  getIsoCountryFlagEmoji,
};
